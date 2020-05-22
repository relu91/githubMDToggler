



const githubPath = window.location.pathname.split("/")
const repoName = githubPath[1]+"/"+githubPath[2]
const pageType = githubPath[3] === "pull" ? "pulls" : githubPath[3]
const id = githubPath[4]

const colorList = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#f1c40f", "#e67e22", "#e74c3c","#f39c12"]

if(pageType === "wiki"){
    //Init UI
    let buttonDiv = document.getElementById("wiki-wrapper").getElementsByClassName("gh-header-title").item(0)
    const toggle = createButtonElement()
    toggle.style.margin = "5px"
    buttonDiv.append(toggle)

    fetch(`https://raw.githubusercontent.com/wiki/${repoName}/${id ? id + ".md" : "Home.md"}`).then(asw => {
        asw.text().then(md =>{
            const wiki = document.getElementById("wiki-body")
            const noMarkdown = cloneChildren(wiki)
            
            const markdown = document.createElement("p")
            markdown.innerText = md

            toggle.onclick = createToggleClick(noMarkdown,[markdown],wiki,toggle)
        })
    })
    
}else{
    // Init UI
    let actions = document.getElementById("discussion_bucket").getElementsByClassName("timeline-comment-actions")
    
    let commentBodies = document.getElementById("discussion_bucket").querySelectorAll(".comment-body:not(.js-preview-body)")

    const toggleButtons = []

    for (let i = 0; i < actions.length; i++) {

        const element = actions[i];
        let toggle = document.createElement("span")

        toggle.style.border = "none"
        toggle.style.display = "inline-flex"
        toggle.style.padding = "6px"
        toggle.style.borderRadius = "5px"
        toggle.style.backgroundColor = "#e3e3e3"

        const url = chrome.runtime.getURL("./only_text_markdown_icon.svg")
        const icon = document.createElement("div")
        icon.style.background = `url(${url})`
        icon.style.width = "10px"
        icon.style.height = "10px"
        icon.style.verticalAlign = "text-bottom"
        toggle.appendChild(icon)
        
        element.prepend(toggle)
        toggleButtons.push(toggle)
    }
    console.log("actions",actions.length)
    InitDataForIssueOrPull(repoName, id, pageType,commentBodies,toggleButtons)

}

function createButtonElement() {
    let toggle = document.createElement("span")

    
    toggle.style.border = "none"
    toggle.style.display = "inline-flex"
    toggle.style.padding = "6px"
    toggle.style.borderRadius = "5px"
    toggle.style.backgroundColor = "#e3e3e3"

    const url = chrome.runtime.getURL("./only_text_markdown_icon.svg")
    const icon = document.createElement("div")
    icon.style.background = `url(${url})`
    icon.style.width = "10px"
    icon.style.height = "10px"
    icon.style.verticalAlign = "text-bottom"
    toggle.appendChild(icon)
    return toggle
}

async function InitDataForIssueOrPull(repo, issueNumber, pageType, commentBodies, toggleButtons) {
    let response = await fetch(`https://api.github.com/repos/${repo}/${pageType}/${issueNumber}`)
    
    response = await response.json()
    const issueBody = response.body

    const markdownElements = createMarkdownElements(issueBody)

    
    const normal = cloneChildren(commentBodies[0])


    toggleButtons[0].onclick = createToggleClick(normal,markdownElements,commentBodies[0],toggleButtons[0]) 

    response = await fetch(response.comments_url)
    response = await response.json()

    console.log(toggleButtons.length,commentBodies.length)
    for (let i = 1; i < toggleButtons.length; i++) {
        const commentBody = response[i - 1].body
        const markdownElements = createMarkdownElements(commentBody)
        const noMarkDown = cloneChildren(commentBodies[i])
        toggleButtons[i].onclick = createToggleClick(noMarkDown,markdownElements,commentBodies[i],toggleButtons[i])
       
    }
}

function cloneChildren(element){
    const children = element.children
    const arr = []
    for (let i = 0; i < children.length; i++) {
        const element =  children[i];
        arr.push(element)
    }
    return arr
}

function createMarkdownElements(text) {
    const lines = text.split("\n")
    const markdownElements = []

    lines.forEach(line => {
        let body = document.createElement("p")
        body.textContent = line
        markdownElements.push(body)
    });

    return markdownElements
}

function createToggleClick(noMarkdownElements,markdownElements,baseElement,button){
    let toggled = false

    return () => {
        if (!toggled) {
            baseElement.innerHTML = ""
            markdownElements.forEach(ele => {
                baseElement.appendChild(ele)
            })
            toggled = true
            button.style.backgroundColor = colorList[Math.floor(Math.random()*colorList.length)]
        } else {
            baseElement.innerHTML = ""
            for (let i = 0; i < noMarkdownElements.length; i++) {
                baseElement.appendChild(noMarkdownElements[i]);
            }
            toggled = false
            button.style.backgroundColor = "#e3e3e3"
        }
    }
}
