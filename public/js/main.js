

async function onLoadBugs() {
    const data = await fetch('/api/bug')
    const bugs = await data.json()
    const elPre = document.querySelector('pre')
    elPre.innerText = JSON.stringify(bugs, null, 4)
}