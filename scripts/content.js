if(document.readyState === 'interactive') {
    setupInteractiveState();
}
//#region Setup functions
function setupInteractiveState() {
    removeSidebarShorts();
    setupHamburgerRemover(); 
    setupCarouselScrollRemover();
    setupPageChange();

}

function setupCarouselScrollRemover() {
    document.addEventListener("scroll", () => {
        removeCarouselShortsByInterval()
     })
    console.log("Sucessfully set up carousel remover")
}

function setupHamburgerRemover() {
    const scrimElement = document.getElementById("scrim")
    const observer = new MutationObserver(handleScrim)    
    
    const scrimConfig = {childList: false, attributes: true}
    
    observer.observe(scrimElement, scrimConfig)
}

//#endregion

function handleScrim(scrimMutationsList, observer) {
    for (let mutation of scrimMutationsList) {
        if (mutation.type !== "attributes") {
            return;
        }
        //remove hamburger and turn off observer when scrim is opened.
        if (mutationTargetClassListIncludes(mutation, "visible")) {
            removeHamburgerShorts();
            observer.disconnect()
        }
    }
}

function mutationTargetClassListIncludes(mutation, value) {
    if (!mutation)
        throw error("No mutation given.")

    if (!value)
        throw error("No value given.")
   return mutation.target.classList.value.includes(value)
}

//#region Page handling
function setupPageManager() {
    const pageManager = document.getElementById("page-manager")
   // console.log(pageManager)
    const observer = new MutationObserver(handlePages)    
    
    const scrimConfig = {childList: true, attributes: true}
    
    observer.observe(pageManager, scrimConfig)
}

async function  setupPageChange()  {
    const ytdApp = document.querySelector("ytd-app")

    waitForElement("yt-page-navigation-progress", 3000).then(() => {

        const pageNavigationProgress = ytdApp.querySelector("yt-page-navigation-progress")
        console.log("pnp")
        console.log(pageNavigationProgress)
    
        const observer = new MutationObserver(checkPage)    
        
        const config = {attributes: true}
        
        observer.observe(pageNavigationProgress, config)
    })
   
}

function checkPage(mutationsList, observer) {
    const pageManager = document.getElementById("page-manager") 
    for (const mutation of mutationsList) {

        if (mutation.target.ariaValueNow != 100) {
            return;
        }
        console.log("Page loaded.")
        const activePage = pageManager.querySelector('[role="main"]')
        console.log(activePage)

        if (!activePage.attributes) {
            return;
        }

        const subtype = activePage.attributes.getNamedItem("page-subtype")

        if (subtype) {
            console.log(subtype)
            handlePageSubtypes(subtype.value)
        }

        
       
    }
}

function handlePageSubtypes(subtype) {
    switch (subtype) {
        case "home":
            console.log("Honey I'm home!")
            break;
        case "subscriptions":
            runOnSubscriptionPage();
            break;
        case "channels":
            runOnChannelsPage();
            break;
        
    }
}

//#endregion

//#region Page specific run-functions

//Removes any shorts in content when the subscriptions page is loaded
function runOnSubscriptionPage() {
    removeCarouselShortsByInterval();
}

function runOnChannelsPage() {
    removeCarouselShortsByInterval(CarouselType.REEL);
}

//#endregion

//#region High level removal functions

//Decides which CarouselType should be uesd. Reel is for channels and rich for everything else.
const CarouselType = Object.freeze({
    RICH: "rich",
    REEL: "reel"
})

//Removes carousel shorts by a fixed interval.
function removeCarouselShortsByInterval(type = CarouselType.RICH) {
    removeShortsWithInterval(
        {
            parentSelector: '#content',
            childSelector: `ytd-${type}-shelf-renderer`,
            shortsName: 'carousel shorts',
        })
}
//Removes the shorts endpoint from the left-hand sidebar
function removeSidebarShorts() {
    removeShortsWithInterval({
        parentSelector: '#content > ytd-mini-guide-renderer > #items',
        childSelector: '[aria-label="Shorts"]',
        shortsName: 'side-bar shorts',
    })
}
//Removes the shorts button from the left-hand hamburger menu
function removeHamburgerShorts() {
    removeShortsFrom({
        parentSelector: '#sections',
        childSelector: '#items > ytd-guide-entry-renderer > a[title="Shorts"]',
        shortsName: 'hamburger shorts',
    })
}
//#endregion

//#region Remover base functions

//Shorts state enum
const State = Object.freeze({
    REMOVED: "removed",
    NULL: "null",
    REMAINS: "remains"
})

//Removes shorts using the remove action by a set interval
function removeShortsWithInterval({parentSelector, childSelector, shortsName, single = true, interval = 500}) {
    const thisInterval = setInterval(() => {
        removeShortsFrom({parentSelector, childSelector, single, shortsName, 
            onRemoval: remove})

    }, interval)
    const remove = () => {clearInterval(thisInterval)}
   
}

//Removes shorts without using an interval.
function removeShortsFrom({parentSelector, childSelector, shortsName, single = true, onRemoval}) {
    try {
        const shorts = querySelectChildFrom({parentSelector, childSelector, single})

        if (shorts && shorts != null) {
            const state = removeShorts(shorts, single)
            logState(state, shortsName)
            //call removal function for timeout if shorts has been removed
            if (onRemoval && typeof onRemoval === 'function' && state == State.REMOVED)
                onRemoval();
        }

        return shorts
    } catch (error) {
        console.error('Error removing %s: %s', shortsName, error)
    }
}
//Query selects from parentSelector using childSelector
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

//Logs the remove state of the supplied shortsName
function logState(state, shortsName) {
    switch (state) {
        case State.NULL:
            console.log('Could not find %s', shortsName)
            break;
        case State.REMAINS:
            console.log('Could not remove %s', shortsName)
            break;
        case State.REMOVED:
            console.log('Successfully removed %s', shortsName)
            break;

    }
}
//Removes the shorts and validates it
function removeShorts(shorts, single) {
    //If no shorts exists
    if (!shorts || shorts == null) {
        return State.NULL
    }

    if (single)
        shorts.parentNode.removeChild(shorts)
    else
        shorts.forEach(short => 
            {
                if (shorts.length >= 1) {
                    short.parentNode.removeChild(short)
            }})

    //If the shorts still exists
    if (shorts.parentNode) {
        return State.REMAINS
    } 
    //if the shorts has successfully been removed
    console.log(shorts)
    return State.REMOVED
}

//#endregion

//#region waitForElement
/**
 * Wait for an element before resolving a promise
 * @param {String} querySelector - Selector of element to wait for
 * @param {Integer} timeout - Milliseconds to wait before timing out, or 0 for no timeout 
 *  
 * From woxxom @ https://stackoverflow.com/questions/34863788/how-to-check-if-an-element-has-been-loaded-on-a-page-before-running-a-script             
 */
function waitForElement(querySelector, timeout){
  return new Promise((resolve, reject)=>{
    var timer = false;
    if(document.querySelector(querySelector)) return resolve();
    const observer = new MutationObserver(()=>{
      if(document.querySelector(querySelector)){
        observer.disconnect();
        if(timer !== false) clearTimeout(timer);
        return resolve();
      }
    });
    observer.observe(document.body, {
      childList: true, 
      subtree: true
    });
    if(timeout) timer = setTimeout(()=>{
      observer.disconnect();
      reject();
    }, timeout);
  });
}

//#endregion