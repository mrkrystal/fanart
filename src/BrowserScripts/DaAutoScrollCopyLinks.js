(() => {
    // Copy and paste into devtools to systematically copy urls for all posts in a given search category (the page you're on)
    // Will run until done or the scroll position is greater than maxScroll, whichever is first, so as to not strain the computer or DA too much

    const maxScroll = 500000;
    const scrollBy = 4000;

    let links = [];

    const addLinks = () => {
        const newLinks = Array.from(document.querySelectorAll('.torpedo-thumb-link')).map(a => a.href);
        links = Array.from(new Set(links.concat(newLinks)));
    }

    const doScroll = (end) => {
        addLinks();

        const originalPosition = window.scrollY;
        window.scrollTo(0, originalPosition + scrollBy);

        setTimeout(() => {
            if (window.scrollY > maxScroll || window.scrollY === originalPosition) {
                end();
                return;
            }

            doScroll(end);
        }, 800);
    }

    doScroll(() => {
        console.log(JSON.stringify(links, null, 4));
    });
})();