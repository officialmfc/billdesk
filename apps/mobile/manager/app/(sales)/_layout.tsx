import { Stack } from "expo-router";
import { getManagerSaleFlowDefinition } from "@mfc/manager-ui";

const auctionFlow = getManagerSaleFlowDefinition("auction");
const directFlow = getManagerSaleFlowDefinition("direct");
const batchFlow = getManagerSaleFlowDefinition("batch");
const floorFlow = getManagerSaleFlowDefinition("floor");

export default function SalesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: "modal" }}>
      <Stack.Screen
        name="auction/new"
        options={{
          title: auctionFlow.entryTitle,
        }}
      />
      <Stack.Screen
        name="mfc/single/new"
        options={{
          title: directFlow.entryTitle,
        }}
      />
      <Stack.Screen
        name="mfc/batch/new"
        options={{
          title: batchFlow.entryTitle,
        }}
      />
      <Stack.Screen
        name="floor/new"
        options={{
          title: floorFlow.entryTitle,
        }}
      />
    </Stack>
  );
}
