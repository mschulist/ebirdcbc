interface GroupProps {
    checklist: string;
    species: string;
    onClick: (species: string, checklist: string, group: string) => void;
}

export function Group({checklist, species, onClick}: GroupProps) {
    return (
        <div className="group">
            <button className="group-button" onClick={() => onClick(species, checklist, "0")}>
                0
            </button>
            <button className="group-button" onClick={() => onClick(species, checklist, "1")}>
                1
            </button>
            <button className="group-button" onClick={() => onClick(species, checklist, "2")}>
                2
            </button>
            <button className="group-button" onClick={() => onClick(species, checklist, "3")}>
                3
            </button>
            <button className="group-button" onClick={() => onClick(species, checklist, "4")}>
                4
            </button>
            <button className="group-button" onClick={() => onClick(species, checklist, "5")}>
                5
            </button>
            <button className="group-button" onClick={() => onClick(species, checklist, "6")}>
                6
            </button>
            <button className="group-button" onClick={() => onClick(species, checklist, "delete")}>
                Delete
            </button>
        </div>
    );
}