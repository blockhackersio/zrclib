import * as Comlink from "comlink";

import { generatePlonkProof } from "@zrclib/sdk";

Comlink.expose(generatePlonkProof);
