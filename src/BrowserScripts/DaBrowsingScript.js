(() => {
    // Usage:
    // Copy and paste array of DA IDs already seen/downloaded into seenIdArray
    // Copy and paste entire script into DevTools
    // DA IDs can be obtained using GetUniqueIdsFromUrls.html with a list of known URLs

    const selection = [];
    const seenIdArray = []; // Add array of DA links here
    const seen = new Set(seenIdArray);

    const addStyle = () => {
        const css = `.krys {
            box-shadow: none !important;
            background-color: hsla(104, 19%, 80%, 1) !important;
        }

        .krys .torpedo-thumb-link > img, .krys .saved-faved-corner, .krys .text-wrap {
            display: none !important;
        }

        .thumb.literature .text-wrap, .thumb.literature .background-art, .thumb.journal .text-wrap, .thumb.journal .background-art {
            display: none !important;
        }

        .selectButton {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1000;
            font-size: 40px;
            opacity: 0;
        }

        .selectButton:hover {
            opacity: 1;
        }

        .krys .selectButton {
            display: none !important;
        }

        [data-focusedParent="true"] {
            box-shadow: 0 0 0 10px red !important;
        }`;
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    };

    addStyle();

    const addToList = (url, parentElement) => {
        selection.push(url);
        parentElement.className += ' krys';
        console.log(selection.length, url);
    };

    const operate = () => {
        Array.from(document.querySelectorAll('a.torpedo-thumb-link:not(.handled)')).forEach((a) => {
            a.className += ' handled';
            const href = a.getAttribute('href');
            const id = href.match(/\d+$/)[0];

            const parent = a.closest('.thumb');

            if (seen.has(id)) {
                parent.className += ' krys';
                return;
            }

            // Auto remove bagi30 artwork
            // Auto remove literature and journal entries
            if ((/\/bagi30\//g).test(href) || (/\bliterature\b/).test(parent.className) || (/\bjournal\b/).test(parent.className)) {
                // addToList(href, parent);
                parent.className += ' krys';
                return;
            }

            parent.innerHTML += `<button class="selectButton" data-url="${href}">Select</button>`;
        });
    };

    operate();
    const interval = setInterval(operate, 1000);

    document.addEventListener('click', (e) => {
        if (e.target.className === 'selectButton') {
            e.stopImmediatePropagation();
            e.preventDefault();
            addToList(e.target.dataset.url, e.target.closest('.thumb'));
        }
    }, true);

    let focusedParent = void 0;

    const setFocusParentChange = (delta) => {
        if (focusedParent) {
            focusedParent.setAttribute('data-focusedParent', 'false');
        }

        const array = Array.from(document.querySelectorAll('button.selectButton')).map((el) => {
            return el.closest('.thumb');
        });

        let indexCurrent = array.indexOf(focusedParent);

        if (indexCurrent === -1) {
            indexCurrent = 0;
        }

        focusedParent = array[indexCurrent + delta];
        focusedParent.scrollIntoView({
            block: 'center',
        });
        focusedParent.setAttribute('data-focusedParent', 'true');
    };
    setFocusParentChange(0);

    window.addEventListener('keyup', (e) => {
        // e
        if (e.keyCode === 69) {
            setFocusParentChange(-1);
        }

        // r
        if (e.keyCode === 82) {
            setFocusParentChange(1);
        }

        // v
        if (e.keyCode === 86) {
            addToList(focusedParent.querySelector('a.torpedo-thumb-link').getAttribute('href'), focusedParent);
        }

        // .
        if (e.keyCode === 190) {
            const newWin = window.open(focusedParent.querySelector('a.torpedo-thumb-link').getAttribute('href'), 'art', "height=1200,width=1600");

            newWin.addEventListener('keyup', (e) => {
                // .
                if (e.keyCode === 190) {
                    newWin.close();
                }
            });
        }
    });

    window.getSelectionUrls = () => {
        console.log(JSON.stringify(Array.from(new Set(selection)), null, '    '));
    };

    window.clearRepeating = () => {
        clearInterval(interval);
    };
})();