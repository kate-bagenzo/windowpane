import fs from 'fs';
import path from 'path';

!(fs.readdirSync("engine/generated")) && fs.mkdirSync("engine/generated");

const errorCheck = [];
fs.readdir('story/assets/pages', {withFileTypes: true}, (err, files) => {
    if (err) {
        throw new Error('Something went wrong reading the directory: ' + err);
    }
    const fileList = [];
    files.forEach((file) => {
        if (file.isFile) {
            const fileNameNoType = file.name.substring(0, file.name.lastIndexOf('.'));
            errorCheck.push(fileNameNoType);
            if (!isNaN(fileNameNoType)) {
                fileList.push(file.name);
            }
        };
    });
    const duplicates = errorCheck.filter((item, index) => errorCheck.indexOf(item) !== index);
    if (duplicates.length > 0) {
        duplicates.unshift('DUPES');
        fs.writeFileSync('engine/generated/fileList.js', `export default ${JSON.stringify(duplicates)};`, 'utf8');
        return;
    }

    fileList.sort((a, b) => {
        const tempA = parseFloat(a.substring(0, a.lastIndexOf('.')));
        const tempB = parseFloat(b.substring(0, b.lastIndexOf('.')));
        const tempC = tempA - tempB;
        return tempC;
    });

    const pagesToUpload = JSON.stringify(fileList);
    fs.writeFileSync('engine/generated/fileList.js', `export default ${pagesToUpload};`, 'utf8');
});

fs.readdir('story/assets/images', {withFileTypes: true}, (err, files) => {
    if (err) {
        throw new Error('Something went wrong reading the directory: ' + err);
    }
    const extraImg = [];
    files.forEach((file) => {
        if (file.isFile) {
            const newPath = path.normalize(`${file.parentPath.replace('story/assets/', '')}/${file.name}`.replace(/\\/g, "/"));
            extraImg.push(newPath);
        };
    });
    const allFilesToUpload = JSON.stringify(extraImg);
    fs.writeFileSync('engine/generated/extraImg.js', `export default ${allFilesToUpload};`, 'utf8')
});

fs.readdir('story/assets/sound', {withFileTypes: true}, (err, files) => {
    if (err) {
        throw new Error('Something went wrong reading the directory: ' + err);
    }
    const extraImg = [];
    files.forEach((file) => {
        if (file.isFile) {
            const newPath = path.normalize(`${file.parentPath.replace('story/assets/', '')}/${file.name}`.replace(/\\/g, "/"));
            extraImg.push(newPath);
        };
    });
    const allFilesToUpload = JSON.stringify(extraImg);
    fs.writeFileSync('engine/generated/extraSound.js', `export default ${allFilesToUpload};`, 'utf8')
});

fs.readdir('story/assets/fonts', {withFileTypes: true}, (err, files) => {
    if (err) {
        throw new Error('Something went wrong reading the directory: ' + err);
    }
    const extraImg = [];
    files.forEach((file) => {
        if (file.isFile) {
            const newPath = path.normalize(`${file.parentPath.replace('story/assets/', '')}/${file.name}`.replace(/\\/g, "/"));
            extraImg.push(newPath);
        };
    });
    const allFilesToUpload = JSON.stringify(extraImg);
    fs.writeFileSync('engine/generated/extraFonts.js', `export default ${allFilesToUpload};`, 'utf8')
});