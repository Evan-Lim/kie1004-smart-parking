// Complete Arduino C++ v3.0 Firmware rewritten strictly using KIE1004 W01-W13 concepts ONLY
// Zero structs, zero enums, zero uint8_t/uint32_t typedefs, zero snprintf/strcmp, zero EEPROM binary serialization.

export const FIRMWARE_FILENAME = 'kie1004_smart_parking_v3.ino';

export interface SyllabusConceptEntry {
  id: string;
  week: string;
  topic: string;
  whereUsed: string;
  searchAnchor: string;
  codeExcerpt: string;
  explanation: string;
}

export interface AdvancedRemovedEntry {
  removedFeature: string;
  whyRemoved: string;
  kie1004Replacement: string;
  weekRef: string;
}

export const ARDUINO_FIRMWARE_V3 = `/*
 * ============================================================================
 * KIE1004: Programming 1 (Semester 1, Session 2025/2026)
 * Project : Smart Multi-Space Parking Assistance & Management System (v3.0)
 * Board   : Arduino Uno R3 (ATmega328P, 20/20 I/O Pins Utilized)
 *
 * SYLLABUS COMPLIANCE (STRICTLY W01 - W13 CONCEPTS ONLY):
 *   W02 - Variables, const constants, basic types (int, bool, char, unsigned long)
 *   W03 - Arithmetic operators (+, -, *, /, %), compound assignment, abs()
 *   W04 - Selection statements (if, else if, else, switch, relational & logical)
 *   W05 - Repetition loops (for, while, do...while)
 *   W06 - Problem solving, input/sensor range validation, clamping
 *   W07 - User-defined functions, prototypes, default arguments, static locals
 *   W08 - Function overloading (printTwoDigits), pass-by-reference (&)
 *   W09 - 1D parallel arrays and passing arrays to functions (const int [])
 *   W10 - 2D multidimensional arrays (LED_PINS[3][3], distHistory[3][3])
 *   W11 - Insertion Sort (median-of-3 noise filter) & Linear Search (open bay)
 *   W12 - Pointers declaration (*), address-of (&), dereferencing (*)
 *   W13 - Pass-by-reference with pointer arguments (int *out1, int *out2)
 *
 * HARDWARE CONFIGURATION (3 BAYS · 20/20 UNO PINS):
 *   - 3x HC-SR04 Ultrasonic Sensors (+1 spare in kit = 3+1 total)
 *       Bay 1: Trig D2,  Echo D3
 *       Bay 2: Trig D4,  Echo D5
 *       Bay 3: Trig D6,  Echo D7
 *   - 9x Diffused LEDs (330-ohm resistors, 3 per bay above sensor)
 *       Bay 1 (G,Y,R): D8,  D9,  D10
 *       Bay 2 (G,Y,R): D11, D12, D13
 *       Bay 3 (G,Y,R): A0,  A1,  A2
 *   - 3x 16x2 I2C LCD Displays (shared A4 SDA / A5 SCL bus, above LEDs)
 *       Bay 1: 0x27 (A0/A1/A2 open)
 *       Bay 2: 0x26 (solder bridge A0)
 *       Bay 3: 0x25 (solder bridge A1)
 *   - 1x 5V Passive Piezo Buzzer on Pin A3 (sounds ONLY when parked > 180 sim min)
 *   - D0 (RX) / D1 (TX) reserved cleanly for USB upload & 9600-baud Serial Monitor
 * ============================================================================
 */

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ============================================================================
// SECTION 1: CONSTANTS (W02 - ALL_CAPS const Naming Convention)
// ============================================================================
const int NUM_BAYS = 3;
const int LEDS_PER_BAY = 3;
const int HISTORY_LEN = 3;

// Parking bay states represented as named integer constants (no enum needed)
const int STATE_AVAILABLE = 0;
const int STATE_SETTLING  = 1;   // Car in slot; waiting 5.0 s stationary
const int STATE_OCCUPIED  = 2;   // Stationary confirmed; count-up running
const int STATE_EXITING   = 3;   // Car left; 3.0 s debounce before receipt

// Distance zone codes (1:20 scale model in cm)
const int ZONE_AVAILABLE = 0;    // > 20 cm
const int ZONE_SAFE      = 1;    // 10 - 20 cm (Green LED)
const int ZONE_CAUTION   = 2;    // 5 - 9 cm   (Yellow LED)
const int ZONE_DANGER    = 3;    // < 5 cm     (Red LED)

// Distance thresholds (cm)
const int DIST_MIN_CM        = 2;
const int DIST_MAX_CM        = 400;
const int DIST_ENTRY_MAX_CM  = 20;
const int DIST_SAFE_MIN_CM   = 10;
const int DIST_CAUTION_MIN_CM = 5;
const int STATIONARY_TOL_CM  = 1;     // +-1 cm deadband absorbs HC-SR04 jitter

// Timing constants (milliseconds)
const unsigned long SENSOR_SLOT_MS    = 40UL;   // 40 ms TDM ultrasonic slot
const unsigned long LCD_SLOT_MS       = 200UL;  // 200 ms staggered 1-LCD refresh
const unsigned long SETTLE_HOLD_MS    = 5000UL; // 5.0 s stationary rule
const unsigned long EXIT_DEBOUNCE_MS  = 3000UL; // 3.0 s exit confirmation
const unsigned long PULSE_TIMEOUT_US  = 15000UL;

// Tariff and overstay rules (simulated minutes)
const int GRACE_MINUTES    = 15;
const int RATE_RM_PER_HOUR = 3;
const int OVERSTAY_MIN     = 180;     // 3 simulated hours -> buzzer alarm

// Hardware Pin Maps using 1D Arrays (W09) and 2D Array (W10)
const int TRIG_PINS[NUM_BAYS] = { 2, 4, 6 };
const int ECHO_PINS[NUM_BAYS] = { 3, 5, 7 };

// 2D Array (W10): Row = Bay (0..2), Col 0 = Green, Col 1 = Yellow, Col 2 = Red
const int LED_PINS[NUM_BAYS][LEDS_PER_BAY] = {
  { 8,  9,  10 },  // Bay 1 LEDs
  { 11, 12, 13 },  // Bay 2 LEDs
  { A0, A1, A2 }   // Bay 3 LEDs (PORTC digital I/O)
};

const int BUZZER_PIN = A3;
const int BUZZER_FREQ_HZ = 2000;

// 3x Dedicated 16x2 I2C LCD Displays (Bay 1 = 0x27, Bay 2 = 0x26, Bay 3 = 0x25)
LiquidCrystal_I2C lcds[NUM_BAYS] = {
  LiquidCrystal_I2C(0x27, 16, 2),
  LiquidCrystal_I2C(0x26, 16, 2),
  LiquidCrystal_I2C(0x25, 16, 2)
};

// ============================================================================
// SECTION 2: PARALLEL 1D & 2D STATE ARRAYS (W09 & W10 - No struct Needed)
// ============================================================================
int bayState[NUM_BAYS]               = { STATE_AVAILABLE, STATE_AVAILABLE, STATE_AVAILABLE };
int filteredDistCm[NUM_BAYS]         = { 400, 400, 400 };
int anchorDistCm[NUM_BAYS]           = { 400, 400, 400 };
int distHistory[NUM_BAYS][HISTORY_LEN] = {
  { 400, 400, 400 },
  { 400, 400, 400 },
  { 400, 400, 400 }
};
int historyPos[NUM_BAYS]             = { 0, 0, 0 };

unsigned long settleStartMs[NUM_BAYS] = { 0, 0, 0 };
unsigned long parkStartMs[NUM_BAYS]   = { 0, 0, 0 };
unsigned long exitStartMs[NUM_BAYS]   = { 0, 0, 0 };
int lastShownKey[NUM_BAYS]            = { -1, -1, -1 };

// Runtime configuration flags
int timeScale = 60;       // 60 = Demo Mode (1 real sec = 1 sim min), 1 = Real-Time
bool debugDistance = false;
int totalCompletedSessions = 0;
int totalRevenueRM = 0;

// ============================================================================
// SECTION 3: FUNCTION PROTOTYPES (W07 - Declarations Before Use)
// ============================================================================
void initHardwarePins(const int trigArr[], const int echoArr[],
                      const int ledMatrix[][LEDS_PER_BAY], int rows);
void initLcdDisplays();
int  measureRawDistanceCm(int trigPin, int echoPin);
void insertionSort(int items[], int n);                              // W11
int  getMedianDistance(const int row[], int n);                      // W09 + W11
int  applySmoothingFilter(int prevCm, int medianCm);                 // W03 + W04
int  classifyDistanceZone(int distCm);                               // W04
int  calculateParkingFee(int elapsedMin, int graceMin = GRACE_MINUTES,
                         int ratePerHour = RATE_RM_PER_HOUR);        // W07 default args
void updateBayMachine(int i, int distCm, unsigned long nowMs,
                      int &revenueRef, int &sessionsRef);            // W08 pass-by-ref (&)
void updateBayLeds(int bayIdx, int state, int zone,
                   unsigned long nowMs, const int ledMatrix[][LEDS_PER_BAY]);
void updateOverstayBuzzer(const int states[], const unsigned long startTimes[],
                          int numBays, unsigned long nowMs);
void renderSingleLcd(int bayIdx, unsigned long nowMs);
void printTwoDigits(LiquidCrystal_I2C &screen, int value);           // W08 overload #1
void printTwoDigits(int value);                                      // W08 overload #2
void printPaddedText(LiquidCrystal_I2C &screen, const char text[], int width);
int  findFirstAvailableBay(const int states[], int numBays);         // W11 linear search
void computeLotSummary(const int states[], const unsigned long startTimes[],
                       int numBays, unsigned long nowMs,
                       int *occupiedPtr, int *overstayPtr);          // W12-13 pointers
void splitSimTime(unsigned long parkStart, unsigned long nowMs, int scale,
                  int *simMinPtr, int *simSecPtr);                   // W13 pointer out
void handleSerialCommands(unsigned long nowMs);
void resetAllBays(int states[], int numBays);

// ============================================================================
// SECTION 4: ARDUINO SETUP & NON-BLOCKING COOPERATIVE LOOP
// ============================================================================
void setup() {
  Serial.begin(115200);
  Wire.begin();

  initHardwarePins(TRIG_PINS, ECHO_PINS, LED_PINS, NUM_BAYS);
  initLcdDisplays();

  Serial.println("====================================================");
  Serial.println(" KIE1004 Smart Parking v3.0 (W01-W13 Clean C++)");
  Serial.println(" Commands: S=Status | T=60x/1x | D=Debug | R=Reset");
  Serial.println("====================================================");
}

void loop() {
  unsigned long nowMs = millis();

  // Static local variables (W07) retain scheduler state without global clutter
  static unsigned long lastSensorMs = 0;
  static int activeSensorBay = 0;

  static unsigned long lastLcdMs = 0;
  static int activeLcdBay = 0;

  // Task 1: Staggered 40 ms TDM ultrasonic polling (prevents acoustic crosstalk)
  if (nowMs - lastSensorMs >= SENSOR_SLOT_MS) {
    lastSensorMs = nowMs;

    int rawCm = measureRawDistanceCm(TRIG_PINS[activeSensorBay], ECHO_PINS[activeSensorBay]);

    // Store raw sample in 2D ring buffer (W10)
    int col = historyPos[activeSensorBay];
    distHistory[activeSensorBay][col] = rawCm;
    historyPos[activeSensorBay] = (col + 1) % HISTORY_LEN;

    // W11 Insertion Sort median-of-3 removes echo spikes before 70/30 smoothing
    int medianCm = getMedianDistance(distHistory[activeSensorBay], HISTORY_LEN);
    filteredDistCm[activeSensorBay] = applySmoothingFilter(filteredDistCm[activeSensorBay], medianCm);

    // Update 4-state Stationary FSM (passes revenue & sessions by reference - W08)
    updateBayMachine(activeSensorBay, filteredDistCm[activeSensorBay], nowMs,
                     totalRevenueRM, totalCompletedSessions);

    if (debugDistance) {
      Serial.print("[DBG] Bay ");
      Serial.print(activeSensorBay + 1);
      Serial.print(" raw=");
      Serial.print(rawCm);
      Serial.print("cm med=");
      Serial.print(medianCm);
      Serial.print("cm filt=");
      Serial.print(filteredDistCm[activeSensorBay]);
      Serial.print("cm state=");
      Serial.println(bayState[activeSensorBay]);
    }

    activeSensorBay = (activeSensorBay + 1) % NUM_BAYS;
  }

  // Task 2: Update all 9 LEDs across the 3x3 2D LED pin matrix (W05 + W10)
  for (int i = 0; i < NUM_BAYS; i++) {
    int zone = classifyDistanceZone(filteredDistCm[i]);
    updateBayLeds(i, bayState[i], zone, nowMs, LED_PINS);
  }

  // Task 3: Overstay-only buzzer on Pin A3 (silent unless time > 180 sim min)
  updateOverstayBuzzer(bayState, parkStartMs, NUM_BAYS, nowMs);

  // Task 4: Staggered 200 ms single-LCD update (keeps I2C bus non-blocking)
  if (nowMs - lastLcdMs >= LCD_SLOT_MS) {
    lastLcdMs = nowMs;
    renderSingleLcd(activeLcdBay, nowMs);
    activeLcdBay = (activeLcdBay + 1) % NUM_BAYS;
  }

  // Task 5: Non-blocking Serial command handler (W04 switch + W05 while)
  handleSerialCommands(nowMs);
}

// ============================================================================
// SECTION 5: HARDWARE INITIALIZATION (W05 Nested Loops + W10 2D Array Param)
// ============================================================================
void initHardwarePins(const int trigArr[], const int echoArr[],
                      const int ledMatrix[][LEDS_PER_BAY], int rows) {
  for (int i = 0; i < rows; i++) {
    pinMode(trigArr[i], OUTPUT);
    digitalWrite(trigArr[i], LOW);
    pinMode(echoArr[i], INPUT);

    // Nested loop (W05 + W10) configures Green, Yellow, Red LEDs for Bay i
    for (int j = 0; j < LEDS_PER_BAY; j++) {
      pinMode(ledMatrix[i][j], OUTPUT);
      digitalWrite(ledMatrix[i][j], LOW);
    }
  }
  pinMode(BUZZER_PIN, OUTPUT);
  noTone(BUZZER_PIN);
}

void initLcdDisplays() {
  for (int i = 0; i < NUM_BAYS; i++) {
    lcds[i].init();
    lcds[i].backlight();
    lcds[i].setCursor(0, 0);
    lcds[i].print("BAY ");
    lcds[i].print(i + 1);
    lcds[i].print(" READY     ");
    lcds[i].setCursor(0, 1);
    lcds[i].print("KIE1004 v3.0    ");
  }
}

// ============================================================================
// SECTION 6: ULTRASONIC SENSOR + W11 INSERTION SORT MEDIAN FILTER
// ============================================================================
int measureRawDistanceCm(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  unsigned long durationUs = pulseIn(echoPin, HIGH, PULSE_TIMEOUT_US);
  if (durationUs == 0) {
    return DIST_MAX_CM;
  }

  // Distance = (duration * 0.0343) / 2  => integer approx: duration / 58
  int cm = (int)(durationUs / 58UL);
  if (cm < DIST_MIN_CM || cm > DIST_MAX_CM) {
    return DIST_MAX_CM;
  }
  return cm;
}

// Exact Insertion Sort algorithm from KIE1004 Week 11 (Slide 9)
void insertionSort(int items[], int n) {
  for (int i = 1; i < n; i++) {
    int moveItem = i;
    while (moveItem > 0 && items[moveItem] < items[moveItem - 1]) {
      int temp = items[moveItem];
      items[moveItem] = items[moveItem - 1];
      items[moveItem - 1] = temp;
      moveItem--;
    }
  }
}

// Copies the 3 recent samples into a local array, sorts them, returns middle
int getMedianDistance(const int row[], int n) {
  int sortedCopy[HISTORY_LEN];
  for (int i = 0; i < n; i++) {
    sortedCopy[i] = row[i];
  }
  insertionSort(sortedCopy, n);
  return sortedCopy[n / 2];
}

int applySmoothingFilter(int prevCm, int medianCm) {
  // Fast jump bypass for sudden vehicle entry or exit (> 100 cm change)
  if (abs(medianCm - prevCm) > 100) {
    return medianCm;
  }
  // 70% previous + 30% new integer smoothing (W03 arithmetic)
  return (7 * prevCm + 3 * medianCm + 5) / 10;
}

// ============================================================================
// SECTION 7: DISTANCE CLASSIFICATION & GRACE-FIRST TARIFF (W03, W04, W07)
// ============================================================================
int classifyDistanceZone(int distCm) {
  if (distCm > DIST_ENTRY_MAX_CM) {
    return ZONE_AVAILABLE;
  } else if (distCm >= DIST_SAFE_MIN_CM) {
    return ZONE_SAFE;
  } else if (distCm >= DIST_CAUTION_MIN_CM) {
    return ZONE_CAUTION;
  } else {
    return ZONE_DANGER;
  }
}

// Uses W07 default arguments (graceMin = 15, ratePerHour = 3)
int calculateParkingFee(int elapsedMin, int graceMin, int ratePerHour) {
  if (elapsedMin <= graceMin) {
    return 0;
  }
  int billableMin = elapsedMin - graceMin;
  // Integer ceiling division: ceil(billableMin / 60) = (billableMin + 59) / 60
  int billableHours = (billableMin + 59) / 60;
  return billableHours * ratePerHour;
}

// ============================================================================
// SECTION 8: 5-SECOND STATIONARY FINITE STATE MACHINE (W04, W08 Pass-by-Ref)
// ============================================================================
void updateBayMachine(int i, int distCm, unsigned long nowMs,
                      int &revenueRef, int &sessionsRef) {
  bool inSlot = (distCm >= DIST_MIN_CM && distCm <= DIST_ENTRY_MAX_CM);

  switch (bayState[i]) {
    case STATE_AVAILABLE:
      if (inSlot) {
        bayState[i] = STATE_SETTLING;
        anchorDistCm[i] = distCm;
        settleStartMs[i] = nowMs;
      }
      break;

    case STATE_SETTLING:
      if (!inSlot) {
        // Vehicle drove away before completing 5-second stop
        bayState[i] = STATE_AVAILABLE;
      } else if (abs(distCm - anchorDistCm[i]) > STATIONARY_TOL_CM) {
        // Vehicle is still moving (> 1 cm delta): re-anchor and reset 5.0 s timer
        anchorDistCm[i] = distCm;
        settleStartMs[i] = nowMs;
      } else if (nowMs - settleStartMs[i] >= SETTLE_HOLD_MS) {
        // Stationary for 5.0 full seconds -> start count-up cleanly at 00:00
        bayState[i] = STATE_OCCUPIED;
        parkStartMs[i] = nowMs;
        Serial.print("[EVENT] Bay ");
        Serial.print(i + 1);
        Serial.println(" stationary 5.0s confirmed -> Timer 00:00");
      }
      break;

    case STATE_OCCUPIED:
      if (!inSlot) {
        bayState[i] = STATE_EXITING;
        exitStartMs[i] = nowMs;
      }
      break;

    case STATE_EXITING:
      if (inSlot) {
        // Brief echo glitch recovered; resume without losing elapsed time
        bayState[i] = STATE_OCCUPIED;
      } else if (nowMs - exitStartMs[i] >= EXIT_DEBOUNCE_MS) {
        // Confirmed exit: compute receipt via W13 pointer output helper
        int totalMin = 0;
        int remSec = 0;
        splitSimTime(parkStartMs[i], nowMs, timeScale, &totalMin, &remSec);
        int feeRM = calculateParkingFee(totalMin);

        // Update caller totals directly via W08 reference parameters (&)
        revenueRef += feeRM;
        sessionsRef++;

        Serial.print("[RECEIPT] Bay ");
        Serial.print(i + 1);
        Serial.print(" | Parked ");
        printTwoDigits(totalMin);
        Serial.print(":");
        printTwoDigits(remSec);
        Serial.print(" | Fee RM ");
        Serial.println(feeRM);

        bayState[i] = STATE_AVAILABLE;
        parkStartMs[i] = 0;
      }
      break;
  }
}

// ============================================================================
// SECTION 9: 9-LED DISTANCE MATRIX & OVERSTAY-ONLY BUZZER (W04, W10)
// ============================================================================
void updateBayLeds(int bayIdx, int state, int zone,
                   unsigned long nowMs, const int ledMatrix[][LEDS_PER_BAY]) {
  int gPin = ledMatrix[bayIdx][0];
  int yPin = ledMatrix[bayIdx][1];
  int rPin = ledMatrix[bayIdx][2];

  bool gOn = false;
  bool yOn = false;
  bool rOn = false;

  if (state == STATE_AVAILABLE) {
    // Bay empty: solid Green indicates open space
    gOn = true;
  } else {
    // Bay has a car: map 3 LEDs to distance zones (Green/Yellow/Red)
    if (zone == ZONE_SAFE) {
      gOn = true;
    } else if (zone == ZONE_CAUTION) {
      yOn = true;
    } else if (zone == ZONE_DANGER) {
      rOn = true;
    } else {
      // Exiting debounce blink
      yOn = ((nowMs / 250UL) % 2UL == 0UL);
    }

    // Visual pulse on Red LED if bay is in overstay (> 180 sim min)
    if (state == STATE_OCCUPIED || state == STATE_EXITING) {
      int simMin = 0;
      int simSec = 0;
      splitSimTime(parkStartMs[bayIdx], nowMs, timeScale, &simMin, &simSec);
      if (simMin > OVERSTAY_MIN) {
        rOn = ((nowMs / 250UL) % 2UL == 0UL);
      }
    }
  }

  digitalWrite(gPin, gOn ? HIGH : LOW);
  digitalWrite(yPin, yOn ? HIGH : LOW);
  digitalWrite(rPin, rOn ? HIGH : LOW);
}

// Buzzer sounds STRICTLY when a car exceeds 180 simulated minutes
void updateOverstayBuzzer(const int states[], const unsigned long startTimes[],
                          int numBays, unsigned long nowMs) {
  int alertBay = -1;

  for (int i = 0; i < numBays; i++) {
    if (states[i] == STATE_OCCUPIED || states[i] == STATE_EXITING) {
      int simMin = 0;
      int simSec = 0;
      splitSimTime(startTimes[i], nowMs, timeScale, &simMin, &simSec);
      if (simMin > OVERSTAY_MIN) {
        alertBay = i;
        break;
      }
    }
  }

  if (alertBay == -1) {
    noTone(BUZZER_PIN);
    return;
  }

  // Bay-coded beep pattern: 1 beep = Bay 1, 2 beeps = Bay 2, 3 beeps = Bay 3
  int beepCount = alertBay + 1;
  unsigned long cyclePos = nowMs % 1500UL;
  int slot = (int)(cyclePos / 200UL);
  bool beepActive = (slot < beepCount * 2) && (slot % 2 == 0);

  if (beepActive) {
    tone(BUZZER_PIN, BUZZER_FREQ_HZ);
  } else {
    noTone(BUZZER_PIN);
  }
}

// ============================================================================
// SECTION 10: 3x 16x2 I2C LCD RENDERING + W08 FUNCTION OVERLOADING
// ============================================================================
// Overload #1 (W08): prints zero-padded 2-digit number to an I2C LCD
void printTwoDigits(LiquidCrystal_I2C &screen, int value) {
  if (value < 10) {
    screen.print("0");
  }
  screen.print(value);
}

// Overload #2 (W08): prints zero-padded 2-digit number to USB Serial Monitor
void printTwoDigits(int value) {
  if (value < 10) {
    Serial.print("0");
  }
  Serial.print(value);
}

void printPaddedText(LiquidCrystal_I2C &screen, const char text[], int width) {
  int count = 0;
  while (text[count] != '\\0' && count < width) {
    screen.print(text[count]);
    count++;
  }
  while (count < width) {
    screen.print(" ");
    count++;
  }
}

void renderSingleLcd(int bayIdx, unsigned long nowMs) {
  LiquidCrystal_I2C &lcd = lcds[bayIdx];
  int st = bayState[bayIdx];
  int dist = filteredDistCm[bayIdx];

  // Build simple integer key to skip unchanged I2C writes (zero flicker)
  int displayKey = st * 10000;

  if (st == STATE_AVAILABLE) {
    displayKey += 1;
    if (displayKey == lastShownKey[bayIdx]) return;
    lastShownKey[bayIdx] = displayKey;

    lcd.setCursor(0, 0);
    lcd.print("BAY ");
    lcd.print(bayIdx + 1);
    printPaddedText(lcd, " AVAILABLE", 11);

    lcd.setCursor(0, 1);
    printPaddedText(lcd, "00:00  FREE BAY", 16);
  } else if (st == STATE_SETTLING) {
    unsigned long heldMs = nowMs - settleStartMs[bayIdx];
    int remainSec = 5 - (int)(heldMs / 1000UL);
    if (remainSec < 0) remainSec = 0;

    displayKey += remainSec * 100 + dist;
    if (displayKey == lastShownKey[bayIdx]) return;
    lastShownKey[bayIdx] = displayKey;

    lcd.setCursor(0, 0);
    lcd.print("B");
    lcd.print(bayIdx + 1);
    lcd.print(" HOLD ");
    lcd.print(remainSec);
    lcd.print("s ");
    if (dist < 10) lcd.print(" ");
    lcd.print(dist);
    lcd.print("cm  ");

    lcd.setCursor(0, 1);
    printPaddedText(lcd, "STOP TO START...", 16);
  } else {
    int simMin = 0;
    int simSec = 0;
    splitSimTime(parkStartMs[bayIdx], nowMs, timeScale, &simMin, &simSec);
    int feeRM = calculateParkingFee(simMin);
    bool isOverstay = (simMin > OVERSTAY_MIN);

    displayKey += simMin * 60 + simSec;
    if (displayKey == lastShownKey[bayIdx]) return;
    lastShownKey[bayIdx] = displayKey;

    // Row 0: Bay ID, State, and Fee (exactly 16 chars)
    lcd.setCursor(0, 0);
    lcd.print("B");
    lcd.print(bayIdx + 1);
    if (isOverstay) {
      lcd.print(" OVERSTAY RM");
    } else {
      lcd.print(" PARKED   RM");
    }
    if (feeRM < 10) lcd.print(" ");
    lcd.print(feeRM);

    // Row 1: Count-Up Timer MM:SS + Distance
    lcd.setCursor(0, 1);
    lcd.print("T:");
    printTwoDigits(lcd, simMin);
    lcd.print(":");
    printTwoDigits(lcd, simSec);
    lcd.print(" ");
    if (dist < 10) lcd.print(" ");
    lcd.print(dist);
    lcd.print("cm   ");
  }
}

// ============================================================================
// SECTION 11: W11 LINEAR SEARCH & W12-W13 POINTER PASS-BY-REFERENCE
// ============================================================================
// Exact Linear Search from KIE1004 Week 11 (Slide 4): returns index or -1
int findFirstAvailableBay(const int states[], int numBays) {
  for (int j = 0; j < numBays; j++) {
    if (states[j] == STATE_AVAILABLE) {
      return j;
    }
  }
  return -1;
}

// W12-W13 Pass-by-Reference with Pointer Arguments (modifies caller counts)
void computeLotSummary(const int states[], const unsigned long startTimes[],
                       int numBays, unsigned long nowMs,
                       int *occupiedPtr, int *overstayPtr) {
  int occ = 0;
  int over = 0;

  for (int i = 0; i < numBays; i++) {
    if (states[i] == STATE_OCCUPIED || states[i] == STATE_EXITING) {
      occ++;
      int simMin = 0;
      int simSec = 0;
      splitSimTime(startTimes[i], nowMs, timeScale, &simMin, &simSec);
      if (simMin > OVERSTAY_MIN) {
        over++;
      }
    }
  }

  *occupiedPtr = occ;
  *overstayPtr = over;
}

// W13 Pointer output parameters: returns two values (minutes & seconds)
void splitSimTime(unsigned long parkStart, unsigned long nowMs, int scale,
                  int *simMinPtr, int *simSecPtr) {
  unsigned long realSec = (nowMs - parkStart) / 1000UL;
  unsigned long simTotalSec = realSec * (unsigned long)scale;
  *simMinPtr = (int)(simTotalSec / 60UL);
  *simSecPtr = (int)(simTotalSec % 60UL);
}

// ============================================================================
// SECTION 12: SERIAL DIAGNOSTIC MONITOR (W04 switch + W05 while)
// ============================================================================
void handleSerialCommands(unsigned long nowMs) {
  while (Serial.available() > 0) {
    char cmd = Serial.read();

    switch (cmd) {
      case 'S':
      case 's': {
        int occCount = 0;
        int overCount = 0;
        // W12-W13 explicit address-of (&) passed to pointer parameters
        computeLotSummary(bayState, parkStartMs, NUM_BAYS, nowMs,
                          &occCount, &overCount);
        int openBay = findFirstAvailableBay(bayState, NUM_BAYS);

        Serial.println("----- SYSTEM STATUS -----");
        Serial.print("Occupied: ");
        Serial.print(occCount);
        Serial.print("/3 | Overstay: ");
        Serial.print(overCount);
        Serial.print(" | Sessions: ");
        Serial.print(totalCompletedSessions);
        Serial.print(" | Revenue: RM ");
        Serial.println(totalRevenueRM);

        if (openBay != -1) {
          Serial.print("Next Open Bay (Linear Search): Bay ");
          Serial.println(openBay + 1);
        } else {
          Serial.println("Lot Status: FULL (no open bay)");
        }
        break;
      }

      case 'T':
      case 't':
        timeScale = (timeScale == 60) ? 1 : 60;
        Serial.print("[MODE] Time scale = ");
        Serial.print(timeScale);
        Serial.println("x");
        break;

      case 'D':
      case 'd':
        debugDistance = !debugDistance;
        Serial.print("[DEBUG] Distance log = ");
        Serial.println(debugDistance ? "ON" : "OFF");
        break;

      case 'R':
      case 'r':
        resetAllBays(bayState, NUM_BAYS);
        Serial.println("[RESET] All 3 bays reset to AVAILABLE.");
        break;

      default:
        break;
    }
  }
}

void resetAllBays(int states[], int numBays) {
  for (int i = 0; i < numBays; i++) {
    states[i] = STATE_AVAILABLE;
    parkStartMs[i] = 0;
    settleStartMs[i] = 0;
    exitStartMs[i] = 0;
    lastShownKey[i] = -1;
  }
  noTone(BUZZER_PIN);
}
`;

export const SYLLABUS_CONCEPT_MAP: SyllabusConceptEntry[] = [
  {
    id: 'w02',
    week: 'W02',
    topic: 'Variables, Data Types & Constants',
    whereUsed: 'Section 1 (Constants) & Section 2 (State Variables)',
    searchAnchor: 'const int NUM_BAYS = 3;',
    codeExcerpt: 'const int SETTLE_HOLD_MS = 5000UL; bool debugDistance = false;',
    explanation:
      'Uses standard KIE1004 primitive types (int, bool, char, unsigned long for millisecond timers) and ALL_CAPS const identifiers instead of magic numbers or raw #define macros.',
  },
  {
    id: 'w03',
    week: 'W03',
    topic: 'Arithmetic, Modulus (%) & Math Helpers',
    whereUsed: 'Section 6 (Smoothing), Section 7 (Fee), Section 11 (Clock)',
    searchAnchor: 'int billableHours = (billableMin + 59) / 60;',
    codeExcerpt: '*simMinPtr = (int)(simTotalSec / 60UL); *simSecPtr = (int)(simTotalSec % 60UL);',
    explanation:
      'Applies integer division (/), modulus (%) for MM:SS clock splitting and ring-buffer wrap-around, ceiling division for hourly billing, compound assignment (+=), and abs() for +-1 cm stationary checks.',
  },
  {
    id: 'w04',
    week: 'W04',
    topic: 'Selection (if / else if / switch / Ternary)',
    whereUsed: 'Section 7 (Zones), Section 8 (FSM switch), Section 12 (Serial switch)',
    searchAnchor: 'switch (bayState[i]) {',
    codeExcerpt: 'if (distCm > DIST_ENTRY_MAX_CM) return ZONE_AVAILABLE; else if (...)',
    explanation:
      'Drives all 4 FSM states via switch/case/break, classifies distance zones via else-if chains, combines relational and logical operators (&&, ||, !), and uses ternary (?:) for pin HIGH/LOW and mode toggling.',
  },
  {
    id: 'w05',
    week: 'W05',
    topic: 'Loops & Nested Repetition (for, while)',
    whereUsed: 'Section 4 (loop LED sweep), Section 5 (nested pin init), Section 10 & 12',
    searchAnchor: 'for (int j = 0; j < LEDS_PER_BAY; j++) {',
    codeExcerpt: 'while (Serial.available() > 0) { ... }',
    explanation:
      'Uses counter-controlled for loops to iterate across the 3 bays and nested for loops for the 3x3 LED matrix, plus while loops for character padding and draining the Serial input buffer.',
  },
  {
    id: 'w06',
    week: 'W06',
    topic: 'Problem Solving & Range Validation',
    whereUsed: 'Section 6 (measureRawDistanceCm) & Section 8 (5s Stationary Rule)',
    searchAnchor: 'if (cm < DIST_MIN_CM || cm > DIST_MAX_CM)',
    codeExcerpt: 'bool inSlot = (distCm >= DIST_MIN_CM && distCm <= DIST_ENTRY_MAX_CM);',
    explanation:
      'Validates ultrasonic pulse echoes against physical sensor bounds (2-400 cm) and rejects invalid 0-us timeouts before feeding data into the stationary confirmation logic.',
  },
  {
    id: 'w07',
    week: 'W07',
    topic: 'Function Prototypes, Default Args & static Locals',
    whereUsed: 'Section 3 (Prototypes), Section 4 (static timers), Section 7 (Fee)',
    searchAnchor: 'int  calculateParkingFee(int elapsedMin, int graceMin = GRACE_MINUTES,',
    codeExcerpt: 'static unsigned long lastSensorMs = 0; static int activeSensorBay = 0;',
    explanation:
      'Declares every user-defined function prototype at the top of the sketch, applies default trailing parameters on calculateParkingFee(), and uses static local variables (W07 Slide 22) for non-blocking timers.',
  },
  {
    id: 'w08',
    week: 'W08',
    topic: 'Function Overloading & Pass-by-Reference (&)',
    whereUsed: 'Section 8 (updateBayMachine) & Section 10 (printTwoDigits)',
    searchAnchor: 'void printTwoDigits(LiquidCrystal_I2C &screen, int value) {',
    codeExcerpt: 'void updateBayMachine(..., int &revenueRef, int &sessionsRef)',
    explanation:
      'Overloads printTwoDigits() with two parameter signatures (LCD stream vs Serial Monitor) and passes totalRevenueRM and totalCompletedSessions by reference (&) so receipts update caller variables cleanly.',
  },
  {
    id: 'w09',
    week: 'W09',
    topic: '1D Parallel Arrays & Passing Arrays to Functions',
    whereUsed: 'Section 2 (Parallel Arrays) & Section 5, 9, 11, 12',
    searchAnchor: 'int bayState[NUM_BAYS]',
    codeExcerpt: 'void resetAllBays(int states[], int numBays)',
    explanation:
      'Replaces advanced C++ structs with clean, synchronized 1D parallel arrays indexed by bay (0..2), passed into modular functions with const int[] read-only safety parameters (W09 Slide 18).',
  },
  {
    id: 'w10',
    week: 'W10',
    topic: '2D Multidimensional Arrays Passed to Functions',
    whereUsed: 'Section 1 (LED_PINS[3][3]), Section 2 (distHistory[3][3]), Section 5 & 9',
    searchAnchor: 'const int LED_PINS[NUM_BAYS][LEDS_PER_BAY] = {',
    codeExcerpt: 'void updateBayLeds(..., const int ledMatrix[][LEDS_PER_BAY])',
    explanation:
      'Maps all 9 LEDs into a 3x3 2D array (rows = bays, cols = G/Y/R) and stores each bay\'s last 3 ultrasonic readings in a 3x3 history matrix, specifying fixed column size when passed to functions (W10 Slide 7).',
  },
  {
    id: 'w11',
    week: 'W11',
    topic: 'Insertion Sort & Linear Search',
    whereUsed: 'Section 6 (insertionSort median filter) & Section 11 (findFirstAvailableBay)',
    searchAnchor: 'void insertionSort(int items[], int n) {',
    codeExcerpt: 'int findFirstAvailableBay(const int states[], int numBays)',
    explanation:
      'Applies exact Week 11 Insertion Sort on each bay\'s 3-sample ultrasonic window to extract the spike-free median, and uses Week 11 Linear Search to locate the first available bay (-1 if full).',
  },
  {
    id: 'w12_13',
    week: 'W12–W13',
    topic: 'Pointers (*, &) & Pass-by-Reference via Pointers',
    whereUsed: 'Section 11 (computeLotSummary, splitSimTime) & Section 12',
    searchAnchor: 'void computeLotSummary(const int states[], const unsigned long startTimes[],',
    codeExcerpt: 'splitSimTime(parkStartMs[i], nowMs, timeScale, &totalMin, &remSec);',
    explanation:
      'Overcomes C++\'s single return-value limit by passing explicit addresses (&occCount, &overCount, &totalMin, &remSec) to pointer parameters and writing results via dereferencing (*occupiedPtr = occ).',
  },
];

export const REMOVED_ADVANCED_CONCEPTS: AdvancedRemovedEntry[] = [
  {
    removedFeature: 'C++ struct (ParkingBay) & Member Access (.)',
    whyRemoved: 'Not covered in KIE1004 W01–W13 lectures.',
    kie1004Replacement: 'Synchronized 1D parallel arrays (bayState[3], parkStartMs[3]) + 2D arrays (LED_PINS[3][3], distHistory[3][3]).',
    weekRef: 'W09 & W10',
  },
  {
    removedFeature: 'enum / enum class Scoped Types',
    whyRemoved: 'Not covered in KIE1004 W01–W13 lectures.',
    kie1004Replacement: 'Named const int state & zone constants (STATE_AVAILABLE = 0, STATE_SETTLING = 1, etc.).',
    weekRef: 'W02',
  },
  {
    removedFeature: 'Fixed-Width Types (uint8_t, uint16_t, uint32_t)',
    whyRemoved: 'AVR C99 typedefs outside introductory W02 data types.',
    kie1004Replacement: 'Standard W02 types: int, bool, char, and unsigned long (justified for millis/pulseIn precision per W02 Slide 22).',
    weekRef: 'W02',
  },
  {
    removedFeature: 'C-Style snprintf() / strcmp() / printf()',
    whyRemoved: 'W02 Slide 11 explicitly instructs students to avoid old-school C printf formatting.',
    kie1004Replacement: 'Overloaded printTwoDigits() + while-loop printPaddedText() + integer displayKey dirty checking.',
    weekRef: 'W02, W05 & W08',
  },
  {
    removedFeature: 'Binary EEPROM.put() / EEPROM.get() & F() Flash Macros',
    whyRemoved: 'Template binary serialization & Harvard-architecture PROGMEM macros are beyond Programming 1.',
    kie1004Replacement: 'Clean RAM state arrays with Serial R-command reset and modular function separation.',
    weekRef: 'W07 & W09',
  },
];
