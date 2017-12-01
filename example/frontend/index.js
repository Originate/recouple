// @flow
import "babel-polyfill";
import * as SafeFetch from "safe-api-fetch";
import * as API from "example-shared/api";

const buttonElement = document.createElement("button");
buttonElement.textContent = "/api/hello";
(document.body: any).appendChild(buttonElement);

const responseElement = document.createElement("div");
(document.body: any).appendChild(responseElement);

buttonElement.addEventListener("click", async () => {
  try {
    const response = await SafeFetch.safeGet("/api", API.hello, {});
    responseElement.textContent = response;
  } catch (e) {
    responseElement.textContent = e;
  }
});
