import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src", "data", "data.json");

export async function readData(): Promise<{ products: any[]; cart: any[] }> {
try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
} catch (err) {
    // Si no existe, inicializa
    const initial = { products: [], cart: [] };
    await writeData(initial);
    return initial;
}
}

export async function writeData(data: { products: any[]; cart: any[] }) {
await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}
