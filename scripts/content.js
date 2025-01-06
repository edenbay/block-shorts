
if(document.readyState === 'interactive') {
    removeSidebarShorts();
    //removeHamburgerShorts();
    runOnSubscriptionPage();
    setupCarouselScrollRemover();
    //lookForShortsActively();
} else if (document.readyState === 'loading') {

}






















// function setupHamburgerRemover() {
//     // Select the node that will be observed for mutations
//     const targetNode = document.getElementById("scrim");

//     // Options for the observer (which mutations to observe)
//     const config = { attributes: true, childList: false, subtree: false };

//     // Callback function to execute when mutations are observed
//     const callback = (mutationList, observer) => {
//     for (const mutation of mutationList) {
//         if (mutation.type === "childList") {
//         console.log("A child node has been added or removed.");
//         } else if (mutation.type === "attributes") {
//         console.log(`The ${mutation.attributeName} attribute was modified.`);
//         }
//     }
//     };

//     // Create an observer instance linked to the callback function
//     const observer = new MutationObserver(callback);

//     // Start observing the target node for configured mutations
//     observer.observe(targetNode, config);

//     // Later, you can stop observing
//     observer.disconnect();
//     const scrim = document.querySelector("#scrim")
//     const classWatcher = new ClassWatcher(scrim, 'trigger')

//     if (scrim.classList.contains("visible"))
//         removeHamburgerShorts();
// }

function removeHamburgerShorts() {
    removeShortsShortsFrom({
        parentSelector: '#sections',
        childSelector: '[title="Shorts"]',
        shortsName: 'hamburger shorts',
    })
}

//Fungerar bara om man refreshar på CTRL + R
function runOnSubscriptionPage() {
    if (document.URL.includes("/feed/subscriptions"))
        removeCarouselShortsByInterval();
    else
        console.warn(document.URL)
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
        }
    )
    }, 1000)
    })
    console.log("Sucessfully set up carousel remover")
}

//---------------------------------------------- Below are to be treated as private functions.
// Functions whose summaries start with 1 are 


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






// document.addEventListener("scroll", () => {
//     setTimeout(() => {
//         lookForShorts();
//         console.log("I looked for shorts.")
//     }, 1000)
// })





































// function lookForShortsCarousel() {
//     const shorts = document.querySelectorAll("ytd-rich-shelf-renderer")

//     if (shorts) {
//         removeShorts(shorts);
//     }

//     return shorts;
// }


// function lookForShortsActively() {
//     const shortsChecker = setInterval(() => {
//         let shorts = lookForShorts();

//         if (shorts) {
//             clearInterval(shortsChecker)
//         }
//     }, 500)
// }


// //Removes the 
// function removeContentShorts(shorts) {
//     if (shorts) {
//         //Removes all loaded shorts instances
//         shorts.forEach(short => {
//             if (shorts.length >= 1) {
//                 short.parentNode.removeChild(short)
//             } 
//         })
//     }
// }



// //Removes the sidebar shorts options from the homepage.
// function removeSideBarShorts() {
//     const sidebar = document.querySelector("#content > ytd-mini-guide-renderer");
//     const options = sidebar.querySelector("#items")

//     //check every half second if shorts option has been loaded.
//     const shortsChecker = setInterval(() => {
//         let shorts = options.querySelector('[aria-label="Shorts"]')
//         if (shorts) {
//             options.removeChild(shorts)
//             clearInterval(shortsChecker)
//             console.log("Successfully removed sidebar shorts.")
//         } else {
//             console.log("Sidebar shorts not loaded yet...")
//         }
            
//     }, 500)
// }

