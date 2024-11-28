
export let currentPage = "loading";

export function switchPage(page) {
    let pages = ["loading", "login-page", "verify-email", "main-page"];
    currentPage = page;
    pages.forEach(pg => {
        if (pg == page) {
            document.getElementById(pg).style.display = 'flex';
        } else {
            document.getElementById(pg).style.display = 'none';
        }
    });
}
