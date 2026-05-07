import { listSectors } from "@/dal/sector.repo";
import { listWallsForSelect } from "@/dal/wall.repo";
import { SectorsCrudClient } from "./sectors-crud-client";

export default async function SectorsPage() {
    const [sectors, walls] = await Promise.all([listSectors(), listWallsForSelect()]);

    return (
        <div className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Sectors</h1>
        <SectorsCrudClient sectors={sectors} walls={walls} />
        </div>
    )
}