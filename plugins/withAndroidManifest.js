const {
  withAndroidManifest: NativeAndroidManifest,
} = require("@expo/config-plugins");

const withAndroidManifest = (config) =>
  NativeAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application[0];

    // Ensure uses-feature array exists for optional features
    if (!config.modResults.manifest["uses-feature"]) {
      config.modResults.manifest["uses-feature"] = [];
    }

    // Initialize activity array if it doesn't exist
    if (!mainApplication.activity) {
      mainApplication.activity = [];
    }

    const googleCastActivityExists = mainApplication.activity.some(
      (activity) =>
        activity.$?.["android:name"] ===
        "com.reactnative.googlecast.RNGCExpandedControllerActivity",
    );

    // Only add the activity if it doesn't already exist
    if (!googleCastActivityExists) {
      mainApplication.activity.push({
        $: {
          "android:name":
            "com.reactnative.googlecast.RNGCExpandedControllerActivity",
          "android:theme": "@style/Theme.MaterialComponents.NoActionBar",
          "android:launchMode": "singleTask",
        },
      });
    }

    const mainActivity = mainApplication.activity.find(
      (activity) => activity.$?.["android:name"] === ".MainActivity",
    );

    if (mainActivity) {
      mainActivity.$["android:supportsPictureInPicture"] = "true";

      if (process.env.EXPO_TV === "1") {
        if (!mainActivity["intent-filter"]) {
          mainActivity["intent-filter"] = [{}];
        }

        // Use the first intent filter or create a new one
        const intentFilter = mainActivity["intent-filter"][0];

        if (!intentFilter.category) {
          intentFilter.category = [];
        }

        const hasLeanbackCategory = intentFilter.category.some(
          (c) =>
            c.$?.["android:name"] ===
            "android.intent.category.LEANBACK_LAUNCHER",
        );

        if (!hasLeanbackCategory) {
          intentFilter.category.push({
            $: {
              "android:name": "android.intent.category.LEANBACK_LAUNCHER",
            },
          });
        }
      }
    }

    if (process.env.EXPO_TV === "1") {
      const usesFeatureArray = config.modResults.manifest["uses-feature"];

      const leanbackFeatureExists = usesFeatureArray.some(
        (feature) =>
          feature.$?.["android:name"] === "android.software.leanback",
      );

      if (!leanbackFeatureExists) {
        usesFeatureArray.push({
          $: {
            "android:name": "android.software.leanback",
            "android:required": "true",
          },
        });
      }
    }

    return config;
  });

module.exports = withAndroidManifest;
