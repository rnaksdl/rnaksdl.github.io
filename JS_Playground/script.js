/*
transaction
	source
		“Dad”
		“Claire”
	amount
		+ for income
		- for spending
	Category
		“Needs”
		“wants”
*/



// JavaScript code​​​​​​‌​‌​‌‌‌‌​‌‌‌​‌‌​​‌‌‌‌​​​‌ below
// Change these values to control whether you see 
// the expected answer and/or hints.
const showExpectedResult = false
const showHints = false

// Setup data
const navContent = `
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Backpacks</a></li>
      <li><a href="#">Other things</a></li>
      <li><a href="#">Contact</a></li>
`;


function createNavMenu(document) {
      const mainNav = document.createElement("nav");
      mainNav.classList.add("main-navigation");
      const navList = document.createElement("ul");
      navList.innerHTML = navContent
      mainNav.append(navList)
      document.querySelector(".siteheader").append(mainNav);
}


createNavMenu(document)




function createParagraph(content) {
    const para = document.createElement("p");
    para.innerHTML = content
    document.querySelector("main").append(para);
}

createParagraph("hiiiiiii")