import cv2
import numpy as np


def calculate_crack_severity(image_path, bbox):
    """
    Estimate road-crack severity using OpenCV.

    Returns:
    {
        "coverage": float,   # affected area percentage
        "severity": str
    }
    """

    try:
        image = cv2.imread(image_path)

        if image is None:
            raise ValueError("Image could not be loaded for crack analysis.")

        # -------------------------
        # Bounding box
        # -------------------------

        x1, y1, x2, y2 = map(int, bbox)

        h, w = image.shape[:2]

        x1 = max(0, min(x1, w - 1))
        y1 = max(0, min(y1, h - 1))
        x2 = max(0, min(x2, w))
        y2 = max(0, min(y2, h))

        if x2 <= x1 or y2 <= y1:
            raise ValueError("Crack bounding box has no image pixels.")

        roi = image[y1:y2, x1:x2]

        if roi.size == 0:
            raise ValueError("Crack bounding box produced an empty image region.")

        # -------------------------
        # Grayscale
        # -------------------------

        gray = cv2.cvtColor(
            roi,
            cv2.COLOR_BGR2GRAY
        )

        # Reduce small image noise
        gray = cv2.GaussianBlur(
            gray,
            (5, 5),
            0
        )

        # -------------------------
        # BLACKHAT TRANSFORM
        # Highlights dark crack
        # structures on bright road
        # -------------------------

        blackhat_kernel = cv2.getStructuringElement(
            cv2.MORPH_RECT,
            (15, 15)
        )

        blackhat = cv2.morphologyEx(
            gray,
            cv2.MORPH_BLACKHAT,
            blackhat_kernel
        )

        # -------------------------
        # Threshold
        # -------------------------

        _, crack_mask = cv2.threshold(
            blackhat,
            0,
            255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )

        # -------------------------
        # Connect broken crack lines
        # -------------------------

        close_kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE,
            (5, 5)
        )

        crack_mask = cv2.morphologyEx(
            crack_mask,
            cv2.MORPH_CLOSE,
            close_kernel,
            iterations=2
        )

        # -------------------------
        # Remove tiny noise
        # -------------------------

        open_kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE,
            (3, 3)
        )

        crack_mask = cv2.morphologyEx(
            crack_mask,
            cv2.MORPH_OPEN,
            open_kernel
        )

        # -------------------------
        # Expand thin cracks so that
        # affected road area is measured
        # -------------------------

        dilate_kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE,
            (5, 5)
        )

        affected_area_mask = cv2.dilate(
            crack_mask,
            dilate_kernel,
            iterations=2
        )

        # -------------------------
        # Remove very small components
        # -------------------------

        contours, _ = cv2.findContours(
            affected_area_mask,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        cleaned_mask = np.zeros_like(
            affected_area_mask
        )

        for contour in contours:
            area = cv2.contourArea(contour)

            if area >= 80:
                cv2.drawContours(
                    cleaned_mask,
                    [contour],
                    -1,
                    255,
                    thickness=cv2.FILLED
                )

        # -------------------------
        # Coverage
        # -------------------------

        affected_pixels = np.count_nonzero(
            cleaned_mask
        )

        total_pixels = cleaned_mask.size

        coverage_percent = (
            affected_pixels / total_pixels
        ) * 100 if total_pixels > 0 else 0.0

        # -------------------------
        # Severity
        # -------------------------

        if coverage_percent >= 20:
            severity = "High"

        elif coverage_percent >= 8:
            severity = "Medium"

        else:
            severity = "Low"

        # -------------------------
        # Debug
        # -------------------------

        print("\n===== CRACK DEBUG =====")
        print("BBox:", bbox)
        print("ROI:", roi.shape[:2])
        print("Affected Pixels:", affected_pixels)
        print("Total Pixels:", total_pixels)
        print(
            "Coverage:",
            round(coverage_percent, 2),
            "%"
        )
        print("Severity:", severity)
        print("=======================\n")

        return {
            "coverage": round(
                float(coverage_percent),
                2
            ),
            "severity": severity
        }

    except Exception as error:
        print("Crack Severity Error:", str(error))
        raise RuntimeError("Unable to calculate crack severity.") from error