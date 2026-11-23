/// <reference types="vite/client" />

const dev = import.meta.env.DEV;

export const menuUrl = dev ? "http://localhost:5173/" : "/";

export const destinations = {
  basho:       dev ? "http://localhost:5184/" : "/basho/",
  poe:         dev ? "http://localhost:5185/" : "/poe/",
  shakespeare: dev ? "http://localhost:5186/" : "/shakespeare-mvc/",
  iambic:      dev ? "http://localhost:5187/" : "/iambic-pentameter/",
};