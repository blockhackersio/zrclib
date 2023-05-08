import * as Comlink from "comlink";

import { generateGroth16Proof } from "@zrclib/sdk";

Comlink.expose(generateGroth16Proof);
