from typing import List, Tuple
from playwright.async_api import Page, async_playwright


async def get_track(username: str, password: str, checklist_ids: List[str]):
    """
    Given a list of checklist ids, return the track points for them.

    Returns:
        A dict mapping each checklist id to its track (or None if no track is available)
    """
    track_map: dict[str, List[Tuple[float, float]]] = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto(
            "https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Flogin%2Fcas%3Fportal%3Debird&locale=en_US",
            wait_until="networkidle",
        )

        if page.url != "https://ebird.org/home":
            await page.type("#input-user-name", username)
            await page.type("#input-password", password)
            await page.click("#form-submit")
            await page.wait_for_load_state()

        for checklist_id in checklist_ids:
            await page.goto(
                f"https://ebird.org/checklist/{checklist_id}", wait_until="networkidle"
            )

            pts = await get_track_from_page(page, checklist_id)
            if pts is None:
                continue
            track_map[checklist_id] = pts
            print(f"got track for {checklist_id}")

        await browser.close()

    return track_map


async def get_track_from_page(page: Page, checklist_id: str):
    url = f"/checklist/{checklist_id}"

    get_track_js = (
        """
        () => {
            async function getOnlyTrack(URL) {
                return await fetchPage(URL, 0, fetchTrackData);
            }

            async function fetchPage(path, id, callback) { // callback is checkIfFlagged or fetchTrackData
                const url = 'https://ebird.org' + path;

                const response = await fetch(url, {
                    redirect: "follow"
                })
                const data = await response.text();
                return callback(data, {
                    id: id,
                    url: url
                });
            }

            function fetchTrackData(data, parms) {
                let id = parms.id;
                let url = parms.url;
                let subId = url.slice(url.lastIndexOf('/') + 1);
                let checklistTitleA = data.match('<title>.*</title>'); // Get the html title
                let checklistTitle = checklistTitleA[0].slice(7, -8);
                let canonical = url;

                if (data.search('<h3 id="flagged"') < 0) { // Do only non-flagged checklists
                    // Find the checklist URL
                    let URLoffset = data.search('<link rel="canonical" href=".*">');
                    if (URLoffset) {
                        let canonical = data.slice(URLoffset + '<link rel="canonical" href="'.length);
                        canonical = canonical.split('"')[0];
                    }

                    let offset = data.indexOf('data-maptrack-data'); // Look for the GPS data in the text
                    if (offset > 0) { // If it's there, process it
                        let linend = data.indexOf('"', offset + 'data-maptrack-data="'.length + 2);
                        data = data.slice(offset + 'data-maptrack-data="'.length, linend);
                        return data;
                    }
                }
            }
        """
        + f"return getOnlyTrack('{url}');"
        + "}"
    )

    track_text = await page.evaluate(get_track_js)

    if track_text is None:
        return None

    track_split = track_text.split(",")

    # each coordinate is a pair of floats, where the first element
    # is the latitude and the second is the longitude
    coords: List[Tuple[float, float]] = []
    for i in range(0, len(track_split), 2):
        coords.append((float(track_split[i + 1]), float(track_split[i])))

    return coords
