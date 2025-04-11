/**
 * Created with gfx-ui@0.0.0 (github.com/arnoson/gfx-ui): a web based graphic editor for creating Adafruit GFX graphics.
 */

 void drawComponentComponent() { // Component (10x10)
  display.drawLine(0, 0, 10, 10, 15); // Line 
};

void drawComponentParam() { // Param (35x12)
  // text-start Text 
  display.setCursor(3, 2);
  display.setTextColor(15);
  display.setFont(&miwos7pt);
  display.print("Param");
  // text-end
};

void drawFrameFrame4() { // Frame4 (128x64)
  drawComponentComponent(29, 22); // Component 
  drawComponentComponent(8, 7); // Component 
  drawComponentComponent(5, 27); // Component 
};