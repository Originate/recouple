// @flow
import "babel-polyfill";
import * as RecoupleFetch from "recouple-fetch";
import * as API from "example-shared/api";

const buttonElement = document.createElement("button");
buttonElement.textContent = "/api/hello";
(document.body: any).appendChild(buttonElement);

const responseElement = document.createElement("div");
(document.body: any).appendChild(responseElement);

buttonElement.addEventListener("click", async () => {
  try {
    const response = await RecoupleFetch.safeGet("/api", API.hello, {});
    responseElement.textContent = response;
  } catch (e) {
    responseElement.textContent = e;
  }
});
