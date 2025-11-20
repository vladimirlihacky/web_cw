### Controls manager

Controls manager is HID device agnostic and can be easily modified to work with gamepad, mobile phone, pregnancy test and etc.

Supported controls are stored in `controls.list`, so if you need to add new functionality just add new entry to `Controls` enum. 

User input events such as `click` / `keyboard` / `mousemove` are translated to `Controls` with `UserIOManager` class.

To add new device support or change keys just modify or extend `UserIOManager`.