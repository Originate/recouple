// @flow
import "babel-polyfill";
import * as SafeAPIClient from "../../src/client";
import * as API from "shared/api";

const buttonElement = document.createElement("button");
buttonElement.textContent = "/api/hello";
document.body.appendChild(buttonElement);

const responseElement = document.createElement("div");
document.body.appendChild(responseElement);

buttonElement.addEventListener('click', async () => {
  try {
    const response = await SafeAPIClient.safeGet("/api", API.hello, {});
    responseElement.textContent = response;
  } catch (e) {
    responseElement.textContent = e;
  }
});

