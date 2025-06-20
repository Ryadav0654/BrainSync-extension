async function checkAuth() {
  const authButton = document.getElementById("auth-button");
  const saveButton = document.getElementById("save");

  try {
    const res = await fetch("https://brainsync.vercel.app/api/auth/session", {
      credentials: "include",
    });

    const session = await res.json();

    if (session && session.user) {
      // console.log("User is logged in:", session.user);
      authButton.innerText = "Dashboard";
      authButton.onclick = () => {
        chrome.tabs.create({
          url: "https://brainsync.vercel.app/dashboard",
        });
      };
      saveButton.disabled = false;
      return true;
    } else {
      console.log("User is not logged in.");
      authButton.innerText = "Login";
      authButton.onclick = () => {
        chrome.tabs.create({
          url: "https://brainsync.vercel.app/signin",
        });
      };
      saveButton.disabled = true;
      return false;
    }
  } catch (error) {
    console.error("Error fetching session:", error);
    authButton.innerText = "Retry";
    authButton.onclick = checkAuth;
    saveButton.disabled = true;
    return false;
  }
}

document.addEventListener("DOMContentLoaded", checkAuth);

document.getElementById("save").addEventListener("click", async () => {
  const saveButton = document.getElementById("save");
  const statusEl = document.getElementById("status");

  saveButton.disabled = true;
  statusEl.textContent = "Saving...";

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const title = document.getElementById("title").value || tab.title;
  const tags = document.getElementById("tags").value;
  const type = document.getElementById("type").value;

  if (!(tags && type)) {
    alert("Tags and type are required!");
    saveButton.disabled = false;
    statusEl.textContent = "";
    return;
  }

  const newUrl = new URL(tab.url);

  if (!newUrl.href) {
    alert("Please provide the valid url!");
  }

  try {
    const response = await fetch("https://brainsync.vercel.app/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        link: newUrl.href,
        type: type,
        title: title,
        tags: tags.split(",").map((t) => t.trim()),
      }),
    });

    if (response.ok) {
      alert("Link saved successfully!");
      statusEl.textContent = "Link saved Successfully!";
    } else {
      alert("Error saving link.");
      statusEl.textContent = "Error saving link.";
      statusEl.style.color = "red";
    }
  } catch (error) {
    console.error("Save error:", error);
    alert("Error saving link.");
    statusEl.textContent = "Error saving link.";
    statusEl.style.color = "red";
  }

  saveButton.disabled = false;
});
