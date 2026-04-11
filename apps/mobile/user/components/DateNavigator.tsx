import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Surface, Text } from "react-native-paper";

type Props = {
  dateStr: string;
  onNext: () => void;
  onPrevious: () => void;
  onSelectDate: (value: string) => void;
  onToday: () => void;
};

function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map((value) => Number(value));
  return new Date(Date.UTC(year, Math.max((month ?? 1) - 1, 0), day ?? 1));
}

function toDateString(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatReadableDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseDateString(dateStr));
}

function startOfMonth(dateStr: string): Date {
  const date = parseDateString(dateStr);
  date.setUTCDate(1);
  return date;
}

function shiftMonth(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function buildMonthGrid(monthDate: Date): Array<{ dateStr: string | null; day: string }> {
  const monthStart = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0));
  const leading = monthStart.getUTCDay();
  const totalDays = monthEnd.getUTCDate();
  const cells: Array<{ dateStr: string | null; day: string }> = [];

  for (let index = 0; index < leading; index += 1) {
    cells.push({ dateStr: null, day: "" });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({
      dateStr: toDateString(new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), day))),
      day: String(day),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ dateStr: null, day: "" });
  }

  return cells;
}

export function DateNavigator({
  dateStr,
  onNext,
  onPrevious,
  onSelectDate,
  onToday,
}: Props) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [monthCursor, setMonthCursor] = useState(startOfMonth(dateStr));
  const monthGrid = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  return (
    <Surface style={styles.surface} elevation={1}>
      <View style={styles.actions}>
        <Button compact mode="text" onPress={onPrevious}>
          Prev
        </Button>
        <Button
          compact
          mode="text"
          onPress={() => {
            setMonthCursor(startOfMonth(dateStr));
            setPickerVisible(true);
          }}
        >
          <Text variant="titleMedium" style={styles.value}>
            {formatReadableDate(dateStr)}
          </Text>
        </Button>
        <Button compact mode="text" onPress={onNext}>
          Next
        </Button>
      </View>
      <Portal>
        <Dialog visible={pickerVisible} onDismiss={() => setPickerVisible(false)}>
          <Dialog.Title>Select Date</Dialog.Title>
          <Dialog.Content>
            <View style={styles.calendarHeader}>
              <Button compact mode="text" onPress={() => setMonthCursor((current) => shiftMonth(current, -1))}>
                Prev
              </Button>
              <Text variant="titleMedium" style={styles.calendarTitle}>
                {formatMonthLabel(monthCursor)}
              </Text>
              <Button compact mode="text" onPress={() => setMonthCursor((current) => shiftMonth(current, 1))}>
                Next
              </Button>
            </View>

            <View style={styles.weekdayRow}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
                <Text key={label} variant="labelSmall" style={styles.weekdayLabel}>
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {monthGrid.map((cell, index) =>
                cell.dateStr ? (
                  <Pressable
                    key={cell.dateStr}
                    style={[
                      styles.dayCell,
                      cell.dateStr === dateStr ? styles.dayCellActive : null,
                    ]}
                    onPress={() => {
                      onSelectDate(cell.dateStr!);
                      setPickerVisible(false);
                    }}
                  >
                    <Text style={cell.dateStr === dateStr ? styles.dayLabelActive : styles.dayLabel}>
                      {cell.day}
                    </Text>
                  </Pressable>
                ) : (
                  <View key={`empty-${index}`} style={styles.dayCellEmpty} />
                )
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                onToday();
                setPickerVisible(false);
              }}
            >
              Today
            </Button>
            <Button onPress={() => setPickerVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  value: {
    fontWeight: "700",
    textAlign: "center",
  },
  calendarHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calendarTitle: {
    fontWeight: "700",
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayLabel: {
    color: "#64748b",
    flex: 1,
    textAlign: "center",
    textTransform: "uppercase",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dayCell: {
    alignItems: "center",
    borderColor: "#cbd5e1",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    width: "13.4%",
  },
  dayCellActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  dayLabel: {
    color: "#0f172a",
  },
  dayLabelActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  dayCellEmpty: {
    minHeight: 38,
    width: "13.4%",
  },
});
