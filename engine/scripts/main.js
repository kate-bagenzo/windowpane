/*

                  o8o                    .o8                                                                        
                  `"'                   "888                                                                        
oooo oooo    ooo oooo  ooo. .oo.    .oooo888   .ooooo.  oooo oooo    ooo oo.ooooo.   .oooo.   ooo. .oo.    .ooooo.  
 `88. `88.  .8'  `888  `888P"Y88b  d88' `888  d88' `88b  `88. `88.  .8'   888' `88b `P  )88b  `888P"Y88b  d88' `88b 
  `88..]88..8'    888   888   888  888   888  888   888   `88..]88..8'    888   888  .oP"888   888   888  888ooo888 
   `888'`888'     888   888   888  888   888  888   888    `888'`888'     888   888 d8(  888   888   888  888    .o 
    `8'  `8'     o888o o888o o888o `Y8bod88P" `Y8bod8P'     `8'  `8'      888bod8P' `Y888""8o o888o o888o `Y8bod8P' 
                                                                          888                                       
                                                                         o888o       
                                                                         
🖼️ 🎞️ 📝 🎲 a multimedia engine

place files in story/assets/pages/ in order
    example: 1.png, 2.html, 3.md, 4.mp4

add commands in story/script.txt
    example: 3 SFX gato.ogg

check the README for more detailed instructions

*/

// #region 📦 setup
// imports
import { marked } from 'marked';
import pages from '../generated/fileList.js';
import preloadImg from '../generated/extraImg.js';
import preloadSound from '../generated/extraSound.js';
import preloadFonts from '../generated/extraFonts.js';

// vars
const debug = import.meta.env.DEV; // true if dev server is running
import pjson from '/package.json';
import config from '/story/config.jsonc';
const storyFolder = './pages/';
const soundFolder = './sound/';


// load bookmark if any
let bookmarkedPage;
let loadedFromBookmark = false;
if (localStorage.getItem("bookmarkedPage") != null) {
    bookmarkedPage = Number(localStorage.getItem("bookmarkedPage"));
} else {
    bookmarkedPage = -1;
}

// refresh to current page on dev server
let currentPage;
if (window.location.hash) {
    const savedPage = window.location.hash.slice((window.location.hash.lastIndexOf('#') + 1));
    savedPage <= pages.length ? currentPage = parseInt(savedPage) - 1 : currentPage = 0;
} else if (bookmarkedPage != -1) {
    currentPage = bookmarkedPage;
    loadedFromBookmark = true;
} else {
    currentPage = 0;
}

// grab elements, set defaults
const viewer = document.getElementById('viewer');
const app = document.getElementById('app');
let instructionList;

const music = document.createElement('audio');
let currentMusicTrack = "";

let userControl = true;
const imageFiles = ['.apng', '.avif', '.bmp', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'];

let volume = 1.0;

// #region 📚 functions
// update #screen
function updateScreen() {
    const currentPageCommands = instructionList[currentPage];
    switch (currentPageCommands.pageType) {
        case 'text':
            fetch(`${storyFolder}${currentPageCommands.filename}`)
            .then(resp => resp.text())
            .then(text => {
                if (text.includes('next-page') || currentPage + 1 == pages.length) {
                    viewer.innerHTML = `<section id="screen" class="text">${marked.parse(text)}</section>`;
                } else {
                    viewer.innerHTML = `<section id="screen" class="text">${marked.parse(text)}<a href="next-page">${config.linkText}</a></section>`;
                }
                applyPageCommands(currentPageCommands);
                const nextPage = document.querySelectorAll("a[href='next-page']");
                for (let link of nextPage) {
                    if (currentPage + 1 == pages.length) {
                        link.remove();
                    } else {
                        link.removeAttribute('href');
                        link.classList.add('next-page');
                        link.addEventListener('click', () => {
                            incrementPage();
                        });
                    }
                }
                if (document.getElementById('focus')) {
                    document.getElementById('focus').tabIndex = "-1";
                    document.getElementById('focus').focus();
                } else {
                    document.getElementById('screen').tabIndex = "-1";
                    document.getElementById('screen').focus();
                }
            })
            break;
        case 'video':
            viewer.innerHTML = `<video volume=${volume} autoplay=${config.loopVideos} width=${config.viewerWidth} height=${config.viewerHeight} id="screen" src="${storyFolder}${pages[currentPage]}">`;
            document.getElementById('screen').volume = volume;
            applyPageCommands(currentPageCommands);
            addContinue();
            document.getElementById('screen').addEventListener('ended', () => {
                document.getElementById('screen').classList.add('video-ended');
            });
            break;
        case 'game':
            viewer.innerHTML = `<object data="${storyFolder}${currentPageCommands.filename}" width="${config.viewerWidth}" height="${config.viewerHeight}" type="text/html" id="screen" class="game"></object>`;
            applyPageCommands(currentPageCommands);
            document.getElementById('screen').tabIndex = "-1";
            document.getElementById('screen').focus();
            document.getElementById('screen').onload = () => {
                const game = document.getElementById('screen').contentWindow.document.querySelector('html');
                const gameComplete = new MutationObserver(incrementGamePage);
                gameComplete.observe(game,{attributeFilter: ['class']});
                game.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                });
            }
            break;
        case 'playedGame':
            viewer.innerHTML = `<aside id="wp-replay-overlay"><p>middle click or press</p><em>Z</em><p>to replay</p></aside><object data="${storyFolder}${currentPageCommands.filename}" width="${config.viewerWidth}" height="${config.viewerHeight}" type="text/html" id="screen"></object>`;
            applyPageCommands(currentPageCommands);
            document.getElementById('screen').tabIndex = "-1";
            document.getElementById('screen').onload = () => {
                const game = document.getElementById('screen').contentWindow.document.querySelector('html');
                const gameComplete = new MutationObserver(incrementGamePage);
                gameComplete.observe(game,{attributeFilter: ['class']});
                game.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                });
            }
            document.getElementById('screen').addEventListener('contextmenu', (e) => {
                e.preventDefault;
            })

            document.getElementById('wp-replay-overlay').addEventListener('auxclick', () => {
                document.getElementById('wp-replay-overlay').style.display = 'none';
                document.getElementById('screen').focus();
            });
            if (!(currentPage + 1 == pages.length)) {
                document.getElementById('viewer').addEventListener('click', () => {
                    incrementPage();
                });
            }
            document.addEventListener('keydown', (e) => {
                if (e.key === 'z' | e.key === 'Z') {
                    document.getElementById('wp-replay-overlay').style.display = 'none';
                    document.getElementById('screen').focus();
                }
            })
            break;
        default:
            viewer.innerHTML = `<img draggable="false" width=${config.viewerWidth} height=${config.viewerHeight} id="screen" class="image" src="${storyFolder}${pages[currentPage]}">`;
            applyPageCommands(currentPageCommands);
            addContinue();
    }
    currentPage == 0 ? document.getElementById('wp-infobar').classList = "" : document.getElementById('wp-infobar').classList = "isHidden";
    debug && (window.location.hash = currentPage + 1);
    debug && console.log(` ${currentPage % 2 ? '📂' : '📁'} filename: ${currentPageCommands.filename}`);
    setTimeout(() => {
        userControl = true;
    }, config.inputDelay);
    preloadPages(3);
}

// page manipulation
function applyPageCommands(currentPageCommands) {
    app.className = currentPageCommands.style;
    currentPageCommands.sfx && playSFX(currentPageCommands.sfx);
    currentPageCommands.music ? playMusic(currentPageCommands.music) : stopMusic();
    document.getElementById('screen').loop = currentPageCommands.loop;

    /* ⚙️ UNCOMMENT FOR CUSTOM FUNCTIONALITY ⚙️

    if (currentPageCommands.custom) {
        const customValue = currentPageCommands.custom;
    }

    */
}

function addContinue() {
    if (!(currentPage + 1 == pages.length)) {
        document.getElementById('screen').addEventListener('click', () => {
            incrementPage();
        });
        document.getElementById('screen').classList.add('wp-continue');
    }
}

function incrementPage() {
    if ((currentPage != pages.length - 1) && userControl) {
        currentPage++;
        userControl = false;
        hideWindows();
        updateScreen();
    }
}

function decrementPage() {
    if (!(currentPage <= 0) && (config.rollBack || (config.rollBack == "true") || debug) && userControl) {
        currentPage--;
        userControl = false;
        hideWindows();
        updateScreen();
    }
}

function incrementGamePage() {
    const game = document.getElementById('screen').contentWindow.document.querySelector('html');
    instructionList[currentPage].pageType = 'playedGame';
    if (game.classList.contains('game-complete')) {
        incrementPage();
    }
}

function preloadPages(value) {
    for (let i = currentPage - 2; i < currentPage + value + 2; i++) {
        if ((i < pages.length) && (i >= 0)) {
            const fileType = pages[i].substring(pages[i].lastIndexOf('.'));
            if (imageFiles.includes(fileType)) {
                const image = new Image();
                image.src = `./${storyFolder}${pages[i]}`;
                image.decode();
            } else {
                fetch(`./${storyFolder}${pages[i]}`);
            }
        }
    }
}

// sounds
function playSFX(sound) {
    const sfx = new Audio(`${soundFolder}${sound}`);
    sfx.volume = volume;
    sfx.play();
}

function playMusic(sound) {
    if (currentMusicTrack == `${soundFolder}${sound}`) {
        return;
    } else {
        currentMusicTrack = `${soundFolder}${sound}`;
        music.src = currentMusicTrack;
        music.loop = true;
        music.volume = volume;
        music.play();
    }
}

function stopMusic() {
    currentMusicTrack = "";
    music.src = "";
    music.removeAttribute('src');
}

function lowerVolume() {
    if (volume > 0) {
        volume -= 0.10;
        volume = Number(volume.toPrecision(2));
    }
    setVolume();
}

function raiseVolume() {
    if (volume <= 0.90) {
        volume += 0.10;
        volume = Number(volume.toPrecision(2));
    }
    setVolume();
}

let volumeTimer;
function setVolume() {
    music.volume = volume;
    document.getElementById('screen').volume = volume;
    document.querySelector('#wp-volume p').innerHTML = `volume: ${volume * 100}%`;
    document.getElementById('wp-volume').classList.remove('isHidden');
    clearTimeout(volumeTimer);
    volumeTimer = setTimeout(() => {
        document.getElementById('wp-volume').classList.add('isHidden');
    }, 2000);
}

// shortcuts & ui
function addShortcuts(){

    document.getElementById('app').addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (!document.getElementById('screen').classList.contains('game')) {
            decrementPage();
        }
    });

    const skipPage = document.getElementById('wp-skip-page');
    const skipInput = document.getElementById('wp-skip-page-input');
    const allowedSkipChars = '0123456789'
    document.getElementById('wp-skip-page-numbers').innerText = `max. ${pages.length}`;
    skipInput.addEventListener('focusout', () => {
        skipInput.value = "";
        skipPage.classList.add('isHidden');
    });

    document.getElementById('wp-help-button').addEventListener('click', () => {
        document.getElementById('wp-help').classList.toggle('isHidden');
    })

    skipInput.addEventListener('keydown', (e) => {
        if (e.key.length == 1 && !(allowedSkipChars.includes(e.key))) {
            e.preventDefault();
        } 
        if (e.key == 'Enter') {
            if (skipInput.value <= pages.length && parseInt(skipInput.value) > 0) {
                currentPage = skipInput.value - 1;
                updateScreen();
            }
            skipInput.value = "";
            skipPage.classList.add('isHidden');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key == ' ' && e.getModifierState('Shift')) {
            // do nothing!
        } else if (e.key == 'ArrowLeft' && e.getModifierState('Shift')) {
            lowerVolume();
        } else if (e.key == 'ArrowRight' && e.getModifierState('Shift')) {
            raiseVolume();
        } else if ((e.key === 'ArrowRight' | (e.key === ' ' && !document.querySelector('.text'))) && !document.getElementById('screen').classList.contains('game')) {
            incrementPage();
        } else if ((e.key === 'ArrowLeft') && !document.getElementById('screen').classList.contains('game')) {
            decrementPage();
        } else if ((e.key === ' ') && !document.getElementById('screen').classList.contains('game')) {
            let scrollTarget;
            document.getElementById('focus') ?  scrollTarget = document.getElementById('focus') :  scrollTarget = document.getElementById('screen');
            scrollTarget.tabIndex = "-1";
            scrollTarget.focus();
            if (Math.abs(scrollTarget.scrollHeight - scrollTarget.clientHeight - scrollTarget.scrollTop) <= 1) {
                incrementPage();
            }
            hideWindows();
        } else if (Number.parseInt(e.key, 10) && (config.rollBack || (config.rollBack == "true") || debug)) {
            if (skipPage.classList.contains('isHidden')) {
                document.getElementById('wp-skip-page-current').innerText = `current: ${currentPage + 1}`;
                bookmarkedPage == -1 ? document.getElementById('wp-skip-page-bookmark').innerText =`no bookmark set` : document.getElementById('wp-skip-page-bookmark').innerText = `bookmark: ${bookmarkedPage + 1}`;
                skipInput.minlength = 0;
                skipInput.maxlength = pages.length.toString().length;
                skipInput.size = pages.length.toString().length;
                skipPage.classList.remove('isHidden');
                skipInput.focus();
            }
            hideWindows();
        } else if (e.key === 'h' | e.key === 'H') {
            document.getElementById('wp-help').classList.toggle('isHidden');
        } else if (e.key === 'b' | e.key === 'B') {
            if (currentPage != -1) {
                if (bookmarkedPage != currentPage) {
                    localStorage.setItem('bookmarkedPage', currentPage);
                    bookmarkedPage = currentPage;
                    document.querySelector('#wp-bookmark p').innerHTML = `page ${currentPage + 1} bookmarked`;
                    document.getElementById('wp-bookmark').classList.remove('isHidden');
                    hideBookmarks();
                } else {
                    localStorage.setItem('bookmarkedPage', -1);
                    bookmarkedPage = -1;
                    document.querySelector('#wp-bookmark p').innerHTML = 'bookmark removed';
                    document.getElementById('wp-bookmark').classList.remove('isHidden');
                    hideBookmarks();
                }
            }
        } else if (e.key === 'l' | e.key === 'L') {
            if (bookmarkedPage != -1) {
                document.querySelector('#wp-bookmark p').innerHTML = 'bookmark loaded';
                document.getElementById('wp-bookmark').classList.remove('isHidden');
                currentPage = bookmarkedPage;
                updateScreen();
                hideBookmarks();
            } else {
                document.querySelector('#wp-bookmark p').innerHTML = 'no saved bookmark';
                document.getElementById('wp-bookmark').classList.remove('isHidden');
                hideBookmarks();
            }
        }
    });
}

let bookmarkTimer;
function hideBookmarks() {
    clearTimeout(bookmarkTimer);
    bookmarkTimer = setTimeout(() => {
            document.getElementById('wp-bookmark').classList.add('isHidden');
    }, 2000);
}

function hideWindows() {
    if (!document.getElementById('wp-help').classList.contains('isHidden')) {
        document.getElementById('wp-help').classList.add('isHidden');
        
    }
}

// #region 🚂 main
// duplicate pages check
if (pages[0] == 'DUPES') {
    document.getElementById('wp-loading').style.opacity = 0;
    debug && console.warn('👯‍♀️ DUPLICATE PAGES');
    pages.shift();
    viewer.innerHTML = `<section id="screen" class="wp-ui-help">
    <h1>windowpane</h1>
    <h2>a multimedia engine</h2>
    <p>you have duplicate pages in the story folder</p>
    <p>affected numbers:</p>
    <p>${pages}</p>
    <p>rename pages to fix this error</p>
    </section>`;
// no pages check
} else if (pages.length == 0) {
    document.getElementById('wp-loading').style.opacity = 0;
    debug && console.log('🗑️ NO PAGES');
    viewer.innerHTML = `<section id="screen" class="wp-ui-help">
    <h1>windowpane</h1>
    <h2>a multimedia engine</h2>
    <p>you don't have any pages in the story folder</p>
    <p>place pages in story/assets/pages/</p>
    <p>accepted files:</p>
    <ul>
    <li>text (.md, .html, .txt)</li>
    <li>image (.apng, .avif, .bmp, .gif, .jpeg/jpg, .png, .svg, .webp)</li>
    <li>video (.mp4, .ogg, .webm)</li>
    </ul>
    </section>`;
} else {
    console.group('🖊️ == STORY INFO ==');
    console.log(`📖 ${config.storyTitle}`);
    console.log(`🧑 by ${config.storyAuthor}`);
    console.log(`🪟 made with windowpane (ver. ${pjson.version})`);
    console.log(`🔗 https://bagenzo.itch.io/windowpane`);
    console.groupEnd();
    debug && console.log(' 🛠️ debug mode ON');
    
    document.title = config.storyTitle;
    document.getElementById('wp-infobar').querySelector('h1').insertAdjacentHTML('beforeend', config.storyTitle);
    document.getElementById('wp-infobar').querySelector('h2').insertAdjacentHTML('beforeend', `by ${config.storyAuthor}`);
    document.getElementById('wp-infobar').querySelector('h1').title = config.storyTitle;
    document.getElementById('wp-infobar').querySelector('h2').title = `by ${config.storyAuthor}`;
    
    // get script commands
    fetch('./script.txt')
    .then(response => response.text())
    .then(instructs => {
        const tempInstructions = new Map();
        const clearReturn = instructs.replace(/[\r]/g, "");
        const splitted = clearReturn.split('\n');
        for (let i = 0; i < splitted.length; i++) {
            if (splitted[i]) {
                const pieces = splitted[i].split(' ');
                const newPage = parseFloat(pieces[0]);
                const newCmd = pieces[1];
                const newValue = pieces[2];
                if (tempInstructions.has(newPage)) {
                    tempInstructions.get(newPage).push({page: newPage, command: newCmd, value: newValue});
                } else {
                    tempInstructions.set(newPage, [{page: newPage, command: newCmd, value: newValue}]);
                }
            }
        }
        debug && console.group(`📜 == SCRIPT COMMANDS APPLIED ==`)
        debug && console.log(tempInstructions);
        debug && console.groupEnd();
        // parse script & pages
        let style = "";
        let sfx = "";
        let loop = config.loopVideos;
        let music = "";
        let pageType = "";
        let text = "";
        let custom = "";
        let filename = "";
        const finalList = [];
        if (pages.length != 0) {
            for (let i = 0; i < pages.length; i++) {
                filename = pages[i];
                sfx = "";
                text = "";
                const check = parseFloat(pages[i].substring(0, pages[i].lastIndexOf('.')));
                const fileType = pages[i].substring(pages[i].lastIndexOf('.'));
                switch (fileType) {
                    case '.md':
                    case '.txt':
                        pageType = 'text';
                        break;
                    case '.mp4':
                    case '.ogg':
                    case '.webm':
                        pageType = 'video';
                        break;
                    case '.html':
                        pageType = 'game';
                        break;
                    default:
                        pageType = 'img'
                }
                if (tempInstructions.has(check)) {
                    loop = config.loopVideos;
                    custom = ""; // ⚙️ delete this line if you want CUSTOM to apply to multiple pages instead of just one
                    for (let j of tempInstructions.get(check)) {
                        switch (j.command) {
                            case 'SETSTYLE':
                                style = j.value;
                                break;
                            case 'SFX':
                                sfx = j.value;
                                break;
                            case 'MUSIC':
                                j.value == 'CLEAR' ? music = "" : music = j.value;
                                break;
                            case 'LOOP':
                                loop = (j.value === 'true');
                                break;
                            case 'CUSTOM':
                                custom = j.value;
                                break;
                        }
                    }
                }
                const tempPage = {};
                if (filename) {tempPage.filename = filename};
                if (pageType) {tempPage.pageType = pageType};
                if (style) {tempPage.style = style};
                if (music) {tempPage.music = music};
                if (sfx) {tempPage.sfx = sfx};
                if (loop) {tempPage.loop = loop};
                if (custom) {tempPage.custom = custom};
                finalList.push(tempPage);
            }
            instructionList = finalList;
            // check game played status
            for (let i = 0; i < currentPage; i++) {
                if (instructionList[i].pageType == 'game') {
                    instructionList[i].pageType = 'playedGame';
                }
            }
            if (debug) {
                for (let i = 0; i < instructionList.length; i++) {
                    if (instructionList[i].pageType == 'game') {
                        instructionList[i].pageType = 'playedGame';
                    }
                }
            }
            debug && console.group('📑 == PAGE LIST ==');
            debug && console.table(instructionList);
            debug && console.groupEnd();
            // preload extras
            for (let i = 0; i < preloadImg.length; i++) {
                const image = new Image();
                image.src = `./${preloadImg[i]}`;
                image.decode();
            }
            for (let i = 0; i < preloadSound.length; i++) {
                fetch(`./${preloadSound[i]}`);
            }
            for (let i = 0; i < preloadFonts.length; i++) {
                fetch(`./${preloadFonts[i]}`);
            }
            document.getElementById('wp-loading').style.opacity = 0;
            setTimeout(() => {
                document.getElementById('wp-loading').style.pointerEvents = 'none';
            }, 800);
            // display info if saved bookmark loaded
            if (loadedFromBookmark) {
                document.querySelector('#wp-bookmark p').innerHTML = `loaded bookmark on page ${currentPage + 1}`;
                document.getElementById('wp-bookmark').classList.remove('isHidden');
                hideBookmarks();
            }
            // apply config settings
            if (!config.rollBack || config.rollBack == "false") {
                if (debug) {
                    console.log('🔙 rollBack is OFF, but enabled on the dev server.')
                } else {
                    document.querySelectorAll('.rollbackHelp').forEach((elem) => {
                        elem.style.display = 'none';
                    });
                }
            }
            if (config.clickToContinue || config.clickToContinue == "true") {
                function hideStart(event) {
                    if (event.key == ' ' || event.key == 'Enter' || event.type == 'click') {
                        document.getElementById('wp-startbutton').style.opacity = 0;
                        document.getElementById('wp-startbutton').style.pointerEvents = 'none'
                        updateScreen();
                        addShortcuts();
                    }
                };
            document.getElementById('wp-startbutton').classList.remove('isHidden');
            document.querySelector('#wp-startbutton button').focus();
            document.querySelector('#wp-startbutton button').addEventListener('keypress', hideStart);
            document.querySelector('#wp-startbutton button').addEventListener('click', hideStart);
            } else {
                // 🚀 let's start!
                updateScreen();
                addShortcuts();
            }
            
        }
    });
}