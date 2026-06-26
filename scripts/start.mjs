import { spawn } from "node:child_process";
import path from "node:path";

const port = process.env.PORT || "3000";
const nextBin = path.join(process.cwd(), "node_modules", ".bin", "next");

const child = spawn(nextBin, ["start", "-p", port], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
