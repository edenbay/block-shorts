

if (document.readyState === 'loading') {
    console.log(document.readyState)
    //setupDOMContentLoaded();
}

if (document.readyState === 'complete') {
    console.log(document.readyState)
    console.log(document.URL)
}

if(document.readyState === 'interactive') {

    setupInteractiveState();
}

document.querySelectorAll("ytd-two-column-browse-results-renderer")

document.querySelectorAll("ytd-browse")



function setupInteractiveState() {
    removeSidebarShorts();
    setupHamburgerRemover(); 
    setupCarouselScrollRemover();
    setupPageManager();
}

function setupDOMContentLoaded() {
    document.addEventListener("DOMContentLoaded", () => {
        runOnSubscriptionPage();

    })
}

function setupHamburgerRemover() {
    const scrimElement = document.getElementById("scrim")

    const observer = new MutationObserver(handleScrim)    
    
    const scrimConfig = {childList: false, attributes: true}
    
    observer.observe(scrimElement, scrimConfig)
}

function handleScrim(scrimMutationsList, observer) {
    for (let mutation of scrimMutationsList) {
        if (mutation.type === "attributes") {
            removeHamburgerShorts();
            observer.disconnect()
        }

    
    }
}

function setupPageManager() {
    const pageManager = document.getElementById("page-manager")

    const observer = new MutationObserver(handlePages)    
    
    const scrimConfig = {childList: true, attributes: true}
    
    observer.observe(pageManager, scrimConfig)
}

function handlePages(scrimMutationsList, observer) {
    for (let mutation of scrimMutationsList) {
       
        const currentPage = mutation.target.querySelector("mini-guide-visible")

        //Kolla om child har mini-guide-visible, då är den sidan vald, hantera därefter.
        console.log(currentPage)
        if (mutation.type === "attributes") {
            console.log(mutation)
        }

    
    }
}


function removeHamburgerShorts() {
    removeShortsFrom({
        parentSelector: '#sections',
        childSelector: '[title="Shorts"]',
        shortsName: 'hamburger shorts',
    })
}

//Removes any shorts in content when the subscriptions page is loaded
function runOnSubscriptionPage() {
    if (document.URL.includes("/feed/subscriptions"))
        removeCarouselShortsByInterval();

}

function removeSidebarShorts() {
    removeShortsWithInterval({
        parentSelector: '#content > ytd-mini-guide-renderer > #items',
        childSelector: '[aria-label="Shorts"]',
        shortsName: 'side-bar shorts'
    })
}



function removeCarouselShortsByInterval() {
    removeShortsWithInterval(
        {
            parentSelector: '#content',
            childSelector: 'ytd-rich-shelf-renderer',
            shortsName: 'carousel shorts'
        })
}

function setupCarouselScrollRemover() {
    document.addEventListener("scroll", () => {
    setTimeout(() => {
       removeShortsFrom(
        {
            parentSelector: '#content',
            childSelector: 'ytd-rich-shelf-renderer',
            shortsName: 'carousel shorts',
            single: false
        })
    }, 2000)
    })
    console.log("Sucessfully set up carousel remover")
}

function debounce_leading(func, timeout = 300){
    let timer;
    return (...args) => {
      if (!timer) {
        func.apply(this, args);
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
      }, timeout);
    };
  }

//---------------------------------------------- Below are to be treated as private functions.


//Removes shorts from source using the remove action by a set interval
function removeShortsWithInterval({parentSelector, childSelector, shortsName, single = true, interval = 500}) {
    const thisInterval = setInterval(() => {

        let shorts = querySelectChildFrom({parentSelector, childSelector, single})

        if (shorts) {
            removeShorts(shorts, single)
            console.log('Successfully removed %s!', shortsName)
            clearInterval(thisInterval)
        } else {
            console.log('Waiting for %s to finish loading...', shortsName)
        }
    }, interval)
}

//Removes shorts without using an interval.
function removeShortsFrom({parentSelector, childSelector, shortsName, single = true}) {
    const shorts = querySelectChildFrom({parentSelector, childSelector, single})

    if (shorts) {
        console.log('Successfully removed %s!', shortsName)
        removeShorts(shorts, single)
    }
    else
        console.log('Waiting for %s to finish loading...', shortsName)

    return shorts
}

function querySelectChildFrom({parentSelector, childSelector, single = true}) {
    let parent = document.querySelector(parentSelector)

    try {
        return (single) ? parent.querySelector(childSelector) 
        : parent.querySelectorAll(childSelector)
    } catch (error) {
        console.error('Invalid child count for %s. Try setting the "single" flag to false.', childSelector)
        console.log(error.error)
    }

}

function removeShorts(shorts, single) {
    if (single)
        shorts.parentNode.removeChild(shorts)
    else
        shorts.forEach(short => 
            {
                if (shorts.length >= 1) {
                    short.parentNode.removeChild(short)
            }})
    
    return shorts
}