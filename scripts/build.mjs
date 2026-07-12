import { cp, mkdir, rm } from "node:fs/promises";

const files = ["index.html", "styles.css", "app.js", "data.js", "logic.js"];
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await Promise.all(files.map((file) => cp(file, `dist/${file}`)));
console.log("网页构建完成：dist 文件夹");
