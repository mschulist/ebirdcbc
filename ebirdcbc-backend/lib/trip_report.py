from typing import List
from playwright.async_api import async_playwright


async def get_trip_report_checklists(trip_report_id: int) -> List[str]:
    """
    Given a trip report id, return a list of checklist ids from the trip report
    """
    url = f"https://ebird.org/tripreport/{trip_report_id}?view=checklists"

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto(url, wait_until="networkidle")

        checklists = await page.evaluate(
            """
            () => {
                let checknums = document
                    .getElementsByClassName("ReportList-checklists")[0]
                    .getElementsByClassName("ChecklistItem");
                let checklists = [];
                for (var i = 0; i < checknums.length; i++) {
                    checklists.push(
                        checknums[i].getElementsByTagName("a")[0].getAttribute("href").slice(11)
                    );
                }
                return checklists;
            }
            """
        )
        await browser.close()
        return checklists
