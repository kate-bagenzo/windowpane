# 🪟 windowpane
🖼️ 🎞️ 📝 🎲 a multimedia engine  
🎀 by kate bagenzo

## 🙋‍♀️ WHAT IS THIS?
this is a tool for creating a sequence of pictures, words, and video, combined with styles and sound.  
you could use it to tell a story (like a comic book), or make something like a collage.

a small sample project is included, but here are some more examples:
- ✈️⛪🍍[bilingual language diary](https://dominoclub.itch.io/bld)
- 💋🌭♀️[s*ssy caption aesthetic II](https://bagenzo.itch.io/captions2)

## 💽 SETUP & USE
1. install [node](https://nodejs.org/en/download)  
2. open this folder in a command line (powershell / command prompt / terminal)  
    - right click the open folder => open in terminal
3. type `npm install`  
    - you only need to run `install` once
4. type `npm start`  
    - this command starts a development server that shows you a preview of your story
    - it automatically refreshes with your changes
    - open `http://localhost/1234` in a web browser to see it
5. edit the story
    - edit `story/assets/config.jsonc`
    - add story files to `story/assets/pages`
    - add commands to `story/assets/script.txt`
6. when you're all finished, type `npm run build`
    - this command outputs the story to `dist/`
    - it's ready to be uploaded somewhere!

more detailed instructions follow

## 📑 GETTING STARTED: EDITING THE CONFIG
start by opening `story/assets/config.jsonc` and editing the settings  
be careful not to delete any commas or quotes!  
choose an ideal width and height - windowpane is designed with the intention that all the pictures will be the same size  

## 🎭 MAKING A STORY
place story files in `story/assets/pages/`  
name your first file `1`, the second `2`, and so on  
example list: `1.png, 2.mp4, 3.md`  
story files will be shown to the reader in order  

👁️ windowpane automatically watches the `story/assets/` folder and all its subfolders, updating the story sequence, so long as `npm run dev` is running  
🏗️ the story is also updated when you create a build with `npm run build`

*️⃣ folders & non-numerical files in the `/pages/` folder are simply ignored
👯‍♀️ duplicate files (e.g. `5.png 5.jpeg`) will cause an error

### 📁 STORY FILES
you can use:
- 🖼️ image files
    - use **.apng**, **.avif**, **.bmp**, **.gif**, **.jpeg/jpg**, **.png**, **.svg**, or **.webp**

- 🎞️ video files
    - use **.mp4**, **.ogg**, or **.webm**
    - doesn't loop by default: can be overriden globally with a variable in `config.jsonc`, or on individual videos using the LOOP command
    - when playback finishes, a `video-ended` css class is added to the `#screen` element

- 📝 text files
    - use **.txt** or **.md**
    - in case of scrolling text, windowpane grabs focus on the `#screen`, for seamless keyboard control
        - if you're writing html inside markdown and need to grab focus in a specific spot, add the `focus` class to an element
    - a link to the next page is automatically created (if applicable)
        - if you want to override this and make your own link, create a link with an href equal to `next-page`  
        - you can change what default links look like in `config.jsonc`
    - a `.text` css class is added to the `#screen` element

- 🎲 games
    - use **.html**
    - ⚠️ this is an advanced feature that requires some knowledge of javascript, as well as a web game made in another tool!
        - focus is automatically given to the game
        - to end the game, set a class of `game-complete` on its html node
            - easiest way: execute `document.querySelector('html').classList.add('game-complete')` inside the game
    - the game must be completed to continue
        - for easier testing, on the dev server all games are assumed to have been played already
    - not all web game engines & tools easily let you run arbitrary javascript
        - i personally recommend:
            - 🥤[bipsi](https://kool.tools/bipsi/)
            - 😍[flicksy 2](https://kool.tools/flicksy2/)

## 💬 USING COMMANDS
write commands in `story/script.txt`  
example command: `3 SFX gato.ogg`  
each command is a single line with three components, separated by a space  
- number  
    - which file the command will run on (this command runs on the page named `3`, e.g. `3.png`)  
    - ⚠️ IMPORTANT ⚠️: specify the FILENAME, not the page number! see the faq for more details  

- type  
    what the command does (SFX plays a sound once)  

- value  
    the filename or value that the command acts on (in this case, `gato.ogg`)  

commands can be written in any order  
in case of contradictory commands (e.g. `4 SETSTYLE example1 4 SETSTYLE example2`) the latest one applies  
to help you write commands, the filename of each page is printed to the browser console on the dev server  
this way, you can go page by page and see what needs editing  

### 💬 COMMAND TYPES
- 🎨 SETSTYLE  
    - set a css class on the game window  
    - example: `2 SETSTYLE example` will apply a class of `.example` to the viewer on the page `2.md`  
    - this removes all other css classes  
    - style persists until another SETSTYLE command is reached, or SETSTYLE CLEAR is used  
        - custom styles are kept in `engine/styles/styles.scss`  
        - if you don't want to write css (or don't know how), there are some basic styles included  
        - classes are applied to the `#app` element  

- 📢 SFX  
    - play a noise  
    - example: `3 SFX gato.ogg` will play the sound `gato.ogg` every visit to `3.png`  
    - place sfx in `story/assets/sound/`  

- 🎹 MUSIC  
    - play a noise and loop it  
    - example: `4 SFX bombas.ogg` will start the music `bombas.ogg` every visit to `4.png`  
    - music continues until another MUSIC command is reached  
    - use MUSIC CLEAR to clear music  
    - place music in `story/assets/sound/`  

- 🔁 LOOP  
    - video pages only: make video loop (or not)  
    - example: `5 LOOP true` or `5 LOOP false`  
    - the default behavior (false) can be adjusted in config.jsonc  

- ⚙️ CUSTOM  
    - a command that has no effect by default  
    - example: `6 CUSTOM example`  
    - it's easily editable so you can quickly add an extra bit of functionality, if needed  
    - just uncomment and edit the commented block in `engine/scripts/main.js`  

## ❓ FAQ

### 🖼️ IMAGES ARE MISSING IN THE FINAL OUTPUT
use relative paths  
instead of `/images/gato.png`, use `./images.gato.png`

### 🔮 I'M LOSING TRACK OF FILENAME/PAGE NUMBERS
hit F12 to bring up the developer tools  
windowpane prints a list of pages, along with story info  
the console also prints the filename of the current page  
this can be useful for command editing  

### 🐘 EDITING WOES WITH A LARGE NUMBER OF PAGES
windowpane lets you remove pages and insert pages in-place, with little difficulty  
all of the pages are simply processed in numerical order:

#### ➕ ADDING A PAGE IN PLACE
use decimals  
example list: `1.png 2.png 3.mp4 4.png 5.png`  
if you wanted to add a page between `3.mp4` and `4.png`, just name it `3.01`  
new list: `1.png 2.png 3.mp4 3.01.png 4.png 5.png`  
you can even add more pages between decimals e.g. `3.01.png 3.015 3.02.png`.  
you can use commands on decimal pages as well. e.g. `3.01 SFX gato.ogg`  

#### ❌ REMOVING A PLACE IN PLACE
just delete it  
example list: `1.png 2.png 3.mp4 4.png 5.png`  
if you wanted to get rid of `3.mp4`, just do so  
new list: `1.png 2.png 4.png 5.png`  
it'll just go from `2.png` to `4.png`  
    ⚠️ note that commands in `script.txt` are based on the FILENAME, not their location in the page list.  
    if you had a command like `3 SFX gato.ogg`, it wouldn't work anymore, because there's no longer a file named `3`.  
    this ensures you can add/remove pages while minimizing the amount of command rewriting you need to do  

### 🙉 SOUND/MUSIC ISN'T PLAYING
browsers need an interaction from the user (e.g. click, keyboard press) before they can play audio.  
this means that music/sound played on the first page won't play immediately.  
if you're uploading to [itch.io](https://itch.io/), they provide a "click to play" button that counts as an interaction.  
if you're uploading somewhere else (or just testing on the dev server), windowpane provides its own "click to play" functionality that can be enabled in `config.jsonc`.  

## 📂 FILE STRUCTURE
- `story/`
    the main folder
    - `/assets/`
        this folder is watched for changes and only files added here (or to subfolders) will be copied over to the final build
        - `/fonts/`
            place fonts here
        - `/images/`
            place non-page images here (background images, images embedded in the text, etc)
        - `/sound/`
            place music and sfx here
        - `/pages/`
            place story pages here, in numerical order  
            no duplicates (e.g. `5.png 5.jpeg`)  
            folders & non-numerical pages are ignored
        - `script.txt`
            script file for commands
    - `config.jsonc`
            config file
    - `styles.scss`
            css file for styles to be used by SETSTYLE

- `engine/`
    the engine folder. unless you want to edit or extend the engine it's not necessary to look inside!
    - `/fonts/`
        fonts used by the engine UI
    - `/functions/`
        utility scripts folder
        - `config-css.js`
            script that turns config variables into css variables
        - `grab-files.js`
            script that reads the `story/assets/` folder and creates a list of assets for the engine to use
    - `/generated/`
        files generated by utility scripts in `/functions/`  
        don't edit these directly
    - `/scripts/`
        main scripts folder
        - `main.js`
        the heart of the engine
        - `icons.js`
        generates icons for the UI
    - `/styles/`
        css files used by the engine UI
        - `reset.scss`
        clears browser-set css to ensure cross-browser compatibility & easier dev
        - `base.scss`
        css settings for the UI

some miscellaneous folders and files:
- ` node_modules/`
    files for node (created during `npm install`)
- `.gitignore`
    files to be ignored by the git version control system
- `icon.png`
    favicon for the page
- `index.html`
    the skeleton of the engine
- `package.json`
    config file for node
- `package-lock.json`
    installation dependency file for node
- `vite.config.js`
    config file for vite, the server/build tool
- `README.md`
    you are here


## ℹ️ ABOUT WINDOWPANE
🪟 windowpane was made by [kate bagenzo](https://katebagenzo.neocities.org/)  
🐢 with node version 20.19.0
🔗 and is distributed under a [CC BY-NC-SA license](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en)  
💌 if you have questions, comments, or just want to show me something you made, feel free to get in touch  

👩‍💻 the first thought that led to windowpane was: what if a game creation tool was just the image/paint program or text editor you're the most acquainted with? at its most basic, all you need to do to create pages is use software you already know.

📖 the second thought was: while collage, comics, and zines definitely have their own culture on the net, it feels like they have not really benefited from this new medium. things like the infinite canvas were dreamed up, but never really came to fruition. wouldn't it be cool if you could easily add more elements enabled by browsers - music, sound, background images, styling - to a piece of work?

🎲 the last thought was: lots of projects that skirt the definition between game/visual novel/webpage exist, but they are niche, and usually require bespoke code to create. wouldn't it be nice if a compromise could be struck, and they could be made simply?

💡 some specific stories and tools that led to the creation of windowpane (maybe they can inspire you as well):
- 🌎⭐🖥️[3D Workers Island](https://mryes.itch.io/3dwiscr)
    a short horror story about a screensaver.
    really effective, minimalist format. the inner workings are actually quite complicated though, with multiple images being drawn on a canvas. that does have its benefits, but i wanted to be able to also write text, show video etc... i could have done all that with a canvas too but it's far more annoying.

- 🟥🪖🟦[TF2 Comics](https://www.teamfortress.com/comics.php)
    very, very silly, but nostalgic and fun.
    this uses a jquery comics viewer for pretty simple purposes but it does the job well... looking at it gave me some ideas.

- 🏠🐸🎱[Homestuck](https://homestuck.github.io/)
    one of the most important multimedia internet projects of all time.
    it's plain html and flash, but i really liked how it mixed videos, games, images, and text, and so was a big inspiration

- 🥔✂️💥[EZM Reader](https://jeremyoduber.itch.io/js-zine)
    a really nice tool for displaying zines made in [electric zine maker](https://alienmelon.itch.io/electric-zine-maker), or any set of images really.
    it's customizable but still a bit opinionated in its presentation - i wanted something more freeform

- 📺🚆🥬[videotome-adv](https://communistsister.itch.io/videotome-adv)
    a cool narrative engine for making web based games.
    the idea for watching the assets folder and auto-updating it came from looking at the way videotome is forced to handle assets and thinking "there's got to be a simpler way..." i worry maybe windowpane's way of doing things became too complicated, though.

- 💧☂️💧[downpour](https://downpour.games/)
    photo collage is sort of my bread and butter and this is the only engine i know that's so dedicated to it. i like it a lot but wanted windowpane to be more simplified - only going forward or backward, no choices or branching etc.


## 🤖 CHANGELOG
### 1.0.0
- initial release
