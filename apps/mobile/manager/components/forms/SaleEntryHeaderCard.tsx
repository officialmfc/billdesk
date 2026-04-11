import type { ReactNode } from "react";
import { StyleSheet } from "react-native";

import { SurfaceCard } from "@/components/ui/SurfaceCard";

type Props = {
  children?: ReactNode;
};

export function SaleEntryHeaderCard({ children }: Props) {
  if (!children) {
    return null;
  }

  return (
    <SurfaceCard style={styles.surface} contentStyle={styles.content}>
      {children}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  surface: {
    elevation: 8,
    position: "relative",
    zIndex: 20,
  },
  content: {
    gap: 10,
  },
});
