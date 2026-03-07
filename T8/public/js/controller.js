/*
 * controller.js
 *
 * CSC309 Tutorial 8
 * 
 * Complete me
 */

let nextParagraph = 1;
let hasNext = true;
let isLoading = false;
let endMessageShown = false;

const dataDiv = document.getElementById("data");
dataDiv.innerHTML = "";

const showEndMessage = () => {
  if (endMessageShown) return;

  const p = document.createElement("p");
  const bold = document.createElement("b");
  bold.textContent = "You have reached the end";
  p.appendChild(bold);
  dataDiv.appendChild(p);

  endMessageShown = true;
}

const createParagraphDiv = (paragraph) => {
  const wrapper = document.createElement("div");
  wrapper.id = `paragraph_${paragraph.id}`;

  const p = document.createElement("p");
  p.appendChild(document.createTextNode(paragraph.content + " "));

  const bold = document.createElement("b");
  bold.textContent = `(Paragraph: ${paragraph.id})`;
  p.appendChild(bold);

  const button = document.createElement("button");
  button.className = "btn like";
  button.textContent = `Likes: ${paragraph.likes}`;

  button.addEventListener("click", async () => {
    try {
      const response = await fetch("/text/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ paragraph: paragraph.id })
      });

      const result = await response.json();
      button.textContent = `Likes: ${result.data.likes}`;
    } catch (err) {
      console.error(err);
    }
  });

  wrapper.appendChild(p);
  wrapper.appendChild(button);

  return wrapper;
}

const loadParagraphs = async () => {
  if (!hasNext || isLoading) return;

  isLoading = true;

  try {
    const response = await fetch(`/text?paragraph=${nextParagraph}`);
    const result = await response.json();

    result.data.forEach((paragraph) => {
      dataDiv.appendChild(createParagraphDiv(paragraph));
    });

    if (result.data.length > 0) {
      nextParagraph = result.data[result.data.length - 1].id + 1;
    }

    hasNext = result.next;

    if (!hasNext) {
      showEndMessage();
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading = false;
  }
}

const handleScroll = () => {
  if (!hasNext || isLoading) return;

  const scrolledToBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight;

  if (scrolledToBottom) {
    loadParagraphs();
  }
}

window.addEventListener("load", loadParagraphs);
window.addEventListener("scroll", handleScroll);