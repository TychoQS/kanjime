import type { CalligraphyAttempt } from "@kanjime/shared";

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it, vi } from "vitest";

import { evaluateCalligraphyAttempt } from "../../../src/Features/Calligraphy/Services/CalligraphyEvaluationService";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OPENCV_ASSET_PATH = path.resolve(
    __dirname,
    "../../../public/opencv/opencv.js"
);

const OPENCV_BUILD_CONFIG_PATH = path.resolve(
    __dirname,
    "../../../scripts/opencv-build/config/opencv_js.config.py"
);

const REQUIRED_COMPILED_OPENCV_SYMBOLS = [
    "SIFT",
    "matFromImageData",
    "matFromArray",
    "cvtColor",
    "CV_32FC2"
] as const;

const REQUIRED_BUILD_CONFIG_SYMBOLS = [
    "SIFT",
    "BFMatcher",
    "DescriptorMatcher",
    "findHomography"
] as const;

const REFERENCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109 109">
  <path d="M 10 10 L 50 10" />
</svg>
`;

const FINALIZED_ATTEMPT: CalligraphyAttempt = {
    targetCharacter: "水",
    categoryId: "jlpt-n5",
    isFinalized: true,
    strokes: [
        {
            startedAt: "2026-05-14T10:00:00.000Z",
            endedAt: "2026-05-14T10:00:01.000Z",
            points: [
                { x: 10, y: 10 },
                { x: 50, y: 10 }
            ]
        }
    ]
};

vi.mock("../../../src/Shared/opencv/Loader", () => ({
    getOpenCvRuntime: () =>
        Promise.reject(new Error("Simulated OpenCV unavailability for integration test")),
    initializeOpenCv: () =>
        Promise.reject(new Error("Simulated OpenCV unavailability for integration test")),
    isOpenCvReady: () => false
}));

describe("Calligraphy OpenCV integration", () => {
    beforeAll(() => {
        Reflect.deleteProperty(globalThis, "cv");

        document.documentElement.style.setProperty("--ion-text-color", "#000000");
        document.documentElement.style.setProperty("--ion-color-primary", "#3880ff");
    });

    it("the packaged OpenCV.js asset exists under public/opencv/opencv.js", () => {
        expect(
            existsSync(OPENCV_ASSET_PATH),
            "The OpenCV.js asset must exist at apps/mobile/public/opencv/opencv.js for the calligraphy pipeline."
        ).toBe(true);
    });

    it("the packaged OpenCV.js asset is not empty", () => {
        const stats = statSync(OPENCV_ASSET_PATH);

        expect(
            stats.size,
            "The OpenCV.js asset must not be empty."
        ).toBeGreaterThan(0);
    });

    it("the packaged OpenCV.js asset contains the compiled symbols directly required by the calligraphy pipeline", () => {
        const opencvSource = readFileSync(OPENCV_ASSET_PATH, "utf8");

        for (const symbol of REQUIRED_COMPILED_OPENCV_SYMBOLS) {
            expect(
                opencvSource,
                `The compiled OpenCV.js asset should contain the "${symbol}" symbol required by the calligraphy pipeline.`
            ).toContain(symbol);
        }
    });

    it("the custom OpenCV build config includes the classes and methods required by the calligraphy pipeline", () => {
        const buildConfigSource = readFileSync(OPENCV_BUILD_CONFIG_PATH, "utf8");

        for (const symbol of REQUIRED_BUILD_CONFIG_SYMBOLS) {
            expect(
                buildConfigSource,
                `The custom OpenCV build config should include "${symbol}" for the calligraphy pipeline.`
            ).toContain(symbol);
        }
    });

    it(
        "the calligraphy evaluation resolves with FALLBACK when OpenCV is unavailable",
        async () => {
            Reflect.deleteProperty(globalThis, "cv");

            const evaluationPromise = evaluateCalligraphyAttempt(
                {
                    loadReferenceStrokeOrder: async () => REFERENCE_SVG,
                    visualComparisonEngine: {
                        computeSimilarity: async () => ({
                            score: 0,
                            strategy: "FALLBACK" as const,
                            matchedKeypointCount: 0,
                            fallbackReason: "insufficient_keypoints" as const
                        }),
                        computeAlignment: async () => ({
                            isHomographyApplied: false
                        })
                    }
                },
                FINALIZED_ATTEMPT
            );

            await expect(
                evaluationPromise,
                "The calligraphy evaluation should resolve instead of throwing when OpenCV is unavailable."
            ).resolves.toBeDefined();

            const result = await evaluationPromise;

            expect(
                result.similarityEvaluation,
                "The evaluation result should include a similarity evaluation when OpenCV is unavailable."
            ).toBeDefined();

            expect(
                result.similarityEvaluation?.strategy,
                "The similarity evaluation should use the FALLBACK strategy when OpenCV is unavailable."
            ).toBe("FALLBACK");

            expect(
                result.visualComparison,
                "The evaluation result should include a visual comparison when OpenCV is unavailable."
            ).toBeDefined();

            expect(
                result.visualComparison?.isHomographyApplied,
                "The visual comparison should report that homography was not applied when OpenCV is unavailable."
            ).toBe(false);

            expect(
                result.score,
                "The global score should remain within the lower bound when OpenCV is unavailable."
            ).toBeGreaterThanOrEqual(0);

            expect(
                result.score,
                "The global score should remain within the upper bound when OpenCV is unavailable."
            ).toBeLessThanOrEqual(100);
        },
        10_000
    );
});