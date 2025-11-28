import { ProxyAgent, setGlobalDispatcher } from "undici";

const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

if (proxyUrl) {
  const agent = new ProxyAgent(proxyUrl);
  setGlobalDispatcher(agent);
  console.log("[proxy] using", proxyUrl);
} else {
  console.log("[proxy] no proxy configured");
}
