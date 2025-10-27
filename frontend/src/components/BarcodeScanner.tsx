import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';

/**
 * Props for the BarcodeScanner component
 */
interface BarcodeScannerProps {
  // Callback function that gets called when a barcode is successfully scanned
  onBarcodeScanned: (barcode: string) => void;
  // Callback to close/cancel the scanner
  onClose: () => void;
}

/**
 * BarcodeScanner Component
 * 
 * This component provides a full-screen camera view that scans barcodes.
 * It uses react-native-camera-kit for reliable barcode detection.
 * 
 * Features:
 * - Full-screen camera view
 * - Scans multiple barcode formats (EAN-13, UPC-A, QR codes, etc.)
 * - Shows visual scanning frame
 * - Handles permissions automatically (will prompt on first use)
 * - Prevents duplicate scans
 * 
 * Note: Make sure camera permissions are configured in Info.plist (iOS) and AndroidManifest.xml (Android)
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned, onClose }) => {
  // State to track if we've already scanned a barcode (prevents multiple scans)
  const [hasScanned, setHasScanned] = useState(false);

  /**
   * Handle barcode detection
   * This function is called when the camera detects a barcode
   */
  const handleBarcode = (event: any) => {
    // Only process if we haven't already scanned
    if (hasScanned) return;
    
    // Get the barcode data
    const barcode = event.nativeEvent.codeStringValue;
    
    if (barcode) {
      // Mark that we've scanned to prevent multiple scans
      setHasScanned(true);
      
      console.log(`Barcode detected: ${barcode}`);
      
      // Call the parent component's callback with the barcode value
      onBarcodeScanned(barcode);
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera component with barcode scanning */}
      <Camera
        key="barcode-camera"
        style={styles.cameraView}
        cameraType={CameraType.Back}
        scanBarcode={true}
        onReadCode={handleBarcode}
        showFrame={false}
        resetFocusTimeout={0}
        resetFocusWhenMotionDetected={true}
      />
      
      {/* Overlay with instructions, scanning frame, and controls */}
      <View style={styles.overlay}>
        {/* Top section with instructions */}
        <View style={styles.topSection}>
          <Text style={styles.instructionText}>
            Position barcode within the frame
          </Text>
          <Text style={styles.subText}>
            Camera will scan automatically
          </Text>
        </View>
        
        {/* Middle section with custom scanning frame */}
        <View style={styles.middleSection}>
          <View style={styles.scanFrame}>
            {/* Corner brackets for scanning frame */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
        
        {/* Bottom section with cancel button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Show scanning indicator when a barcode has been detected */}
      {hasScanned && (
        <View style={styles.scannedOverlay}>
          <View style={styles.scannedBox}>
            <Text style={styles.scannedText}>✓ Barcode Detected!</Text>
            <Text style={styles.scannedSubtext}>Processing...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

/**
 * Styles for the BarcodeScanner component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  // Camera view - explicit dimensions
  cameraView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    backgroundColor: '#000', // Fallback color if camera doesn't load
  },
  
  // Overlay structure
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    pointerEvents: 'box-none', // Allow touches to pass through to camera
    zIndex: 1,
  },
  
  topSection: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingBottom: 30,
  },
  
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  
  // Corner brackets for scanning frame
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  
  bottomSection: {
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingTop: 30,
  },
  
  // Instructions text
  instructionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  
  subText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  // Cancel button
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Scanned indicator overlay
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedBox: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  scannedText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scannedSubtext: {
    color: '#fff',
    fontSize: 16,
  },
});

export default BarcodeScanner;
