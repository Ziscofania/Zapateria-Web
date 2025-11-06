import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.resolve(__dirname, "../data/users.json");


export type User = {
  id: string;
  email: string;
  passwordHash: string;
  twoFactorSecret?: string; // base32
  twoFactorEnabled?: boolean;
};

function ensureFile() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify({ users: [] }, null, 2));
  }
}

export function readUsers(): User[] {
  ensureFile();
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  const data = JSON.parse(raw);
  return data.users as User[];
}

export function writeUsers(users: User[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ users }, null, 2));
}

export function findUserByEmail(email: string): User | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function saveOrUpdateUser(user: User) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  writeUsers(users);
}
