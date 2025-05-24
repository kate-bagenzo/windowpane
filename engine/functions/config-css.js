import fs from 'fs';
import { jsonc } from 'jsonc';

const config = jsonc.parse(fs.readFileSync('story/config.jsonc', 'utf-8'));

fs.writeFileSync('engine/generated/config.scss',
    `$config: (
    viewerWidth: ${config.viewerWidth}px,
    viewerHeight: ${config.viewerHeight}px,
    bgColor: ${config.bgColor},
    fgColor: ${config.fgColor}
    );`);