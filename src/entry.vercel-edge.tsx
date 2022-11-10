import { createQwikCity } from "../fake_modules/qwik-city/middleware/vercel-edge";
import qwikCityPlan from "@qwik-city-plan";
import render from "./entry.ssr";

export default createQwikCity({ render, qwikCityPlan });
