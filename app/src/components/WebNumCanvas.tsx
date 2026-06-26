import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web/LoadSkiaWeb";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { lazy, Suspense } from "react";

const NumCanvas = lazy(() => import("./NumCanvas"));

export default function WebNumCanvas() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    LoadSkiaWeb({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.41.1/bin/full/${file}`,
    })
    .then(() => {
      setLoaded(true)
    })
    .catch((e) => {
      console.log(`Skia failed to load: ${e}`)
    });
  }, []);

  if (!loaded) return <Text>Loading Graphics...</Text>;
  
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <NumCanvas />
    </Suspense>
  );
}