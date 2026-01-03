class FlutterGenerator {
  constructor() {
    this.templates = {
      main: this.mainDartTemplate(),
      pubspec: this.pubspecTemplate(),
      androidManifest: this.androidManifestTemplate(),
      iosInfoPlist: this.iosInfoPlistTemplate()
    };
  }

  generateProject(description, appName = 'RAHLApp') {
    const projectId = 'rahl_' + Date.now();
    const packageName = `com.rahl.${appName.toLowerCase().replace(/\s+/g, '')}`;
    
    // Simple AI parsing (will be enhanced with actual AI)
    const features = this.parseDescription(description);
    
    return {
      projectId,
      appName,
      packageName,
      features,
      files: this.generateFiles(appName, packageName, features)
    };
  }

  parseDescription(description) {
    const features = {
      screens: [],
      hasLogin: false,
      hasDatabase: false,
      hasCamera: false,
      hasMaps: false,
      theme: 'light'
    };

    const desc = description.toLowerCase();
    
    if (desc.includes('login') || desc.includes('sign in')) {
      features.hasLogin = true;
      features.screens.push('LoginScreen');
    }
    
    if (desc.includes('camera') || desc.includes('photo')) {
      features.hasCamera = true;
    }
    
    if (desc.includes('map') || desc.includes('location')) {
      features.hasMaps = true;
    }
    
    if (desc.includes('dark')) {
      features.theme = 'dark';
    }
    
    // Default screens
    if (features.screens.length === 0) {
      features.screens = ['HomeScreen', 'ProfileScreen'];
    }
    
    return features;
  }

  generateFiles(appName, packageName, features) {
    return {
      'pubspec.yaml': this.generatePubspec(appName, features),
      'lib/main.dart': this.generateMainDart(appName, features),
      'android/app/src/main/AndroidManifest.xml': this.generateAndroidManifest(packageName, features),
      'ios/Runner/Info.plist': this.generateIOSInfoPlist(appName, features),
      'README.md': this.generateReadme(appName)
    };
  }

  generatePubspec(appName, features) {
    let dependencies = '\n  flutter:\n    sdk: flutter\n  cupertino_icons: ^1.0.2';
    
    if (features.hasLogin) {
      dependencies += '\n  firebase_auth: ^4.2.5';
    }
    
    if (features.hasCamera) {
      dependencies += '\n  camera: ^0.10.5';
    }
    
    if (features.hasMaps) {
      dependencies += '\n  google_maps_flutter: ^2.2.3';
    }
    
    return `name: ${appName.toLowerCase().replace(/\s+/g, '_')}
description: A RAHL-generated Flutter application
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:${dependencies}

flutter:
  uses-material-design: true
`;
  }

  generateMainDart(appName, features) {
    const screens = features.screens.map(screen => 
      `        '${screen.toLowerCase()}': (context) => ${screen}(),`
    ).join('\n');

    return `import 'package:flutter/material.dart';

void main() => runApp(const ${appName.replace(/\s+/g, '')}());

class ${appName.replace(/\s+/g, '')} extends StatelessWidget {
  const ${appName.replace(/\s+/g, '')}({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${appName}',
      theme: ${features.theme === 'dark' ? 'ThemeData.dark()' : 'ThemeData.light()'},
      initialRoute: '/',
      routes: {
${screens}
      },
      home: ${features.screens[0]}(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Welcome to RAHL App'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              '🎉 Your RAHL-Generated App',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            const Text(
              'Created with zero coding experience!',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: () {},
              child: const Text('Get Started'),
            ),
          ],
        ),
      ),
    );
  }
}
`;
  }

  generateAndroidManifest(packageName, features) {
    let permissions = '';
    
    if (features.hasCamera) {
      permissions += '\n    <uses-permission android:name="android.permission.CAMERA" />';
    }
    
    if (features.hasMaps) {
      permissions += '\n    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />';
    }
    
    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">${permissions}
    
    <application
        android:label="${packageName}"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:allowBackup="false"
        android:theme="@style/LaunchTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
                android:name="io.flutter.embedding.android.NormalTheme"
                android:resource="@style/NormalTheme" />
            <meta-data
                android:name="io.flutter.embedding.android.SplashScreenDrawable"
                android:resource="@drawable/launch_background" />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>`;
  }

  generateIOSInfoPlist(appName, features) {
    let permissions = '';
    
    if (features.hasCamera) {
      permissions += '\n\t<key>NSCameraUsageDescription</key>\n\t<string>Camera access is needed to take photos</string>';
    }
    
    if (features.hasMaps) {
      permissions += '\n\t<key>NSLocationWhenInUseUsageDescription</key>\n\t<string>Location access is needed for maps</string>';
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundleDevelopmentRegion</key>
\t<string>\$(DEVELOPMENT_LANGUAGE)</string>
\t<key>CFBundleDisplayName</key>
\t<string>${appName}</string>
\t<key>CFBundleExecutable</key>
\t<string>\$(EXECUTABLE_NAME)</string>
\t<key>CFBundleIdentifier</key>
\t<string>\$(PRODUCT_BUNDLE_IDENTIFIER)</string>
\t<key>CFBundleInfoDictionaryVersion</key>
\t<string>6.0</string>
\t<key>CFBundleName</key>
\t<string>${appName}</string>
\t<key>CFBundlePackageType</key>
\t<string>APPL</string>
\t<key>CFBundleShortVersionString</key>
\t<string>1.0.0</string>
\t<key>CFBundleSignature</key>
\t<string>????</string>
\t<key>CFBundleVersion</key>
\t<string>1</string>
\t<key>LSRequiresIPhoneOS</key>
\t<true/>${permissions}
\t<key>UIApplicationSupportsIndirectInputEvents</key>
\t<true/>
\t<key>UILaunchStoryboardName</key>
\t<string>LaunchScreen</string>
\t<key>UIMainStoryboardFile</key>
\t<string>Main</string>
\t<key>UISupportedInterfaceOrientations</key>
\t<array>
\t\t<string>UIInterfaceOrientationPortrait</string>
\t\t<string>UIInterfaceOrientationLandscapeLeft</string>
\t\t<string>UIInterfaceOrientationLandscapeRight</string>
\t</array>
\t<key>UISupportedInterfaceOrientations~ipad</key>
\t<array>
\t\t<string>UIInterfaceOrientationPortrait</string>
\t\t<string>UIInterfaceOrientationPortraitUpsideDown</string>
\t\t<string>UIInterfaceOrientationLandscapeLeft</string>
\t\t<string>UIInterfaceOrientationLandscapeRight</string>
\t</array>
</dict>
</plist>`;
  }

  generateReadme(appName) {
    return `# ${appName}

This app was generated by **RAHL** (Rapid App Helper & Launcher).

## Features
- ✅ Cross-platform (Android & iOS)
- ✅ Zero-code development
- ✅ RAHL AI-powered generation
- ✅ Ready to publish

## Next Steps
1. Open this project in Android Studio or VS Code
2. Run \`flutter pub get\`
3. Connect a device or emulator
4. Run \`flutter run\`

## Publishing
### Android
- Run \`flutter build apk --release\`
- Upload to Google Play Console

### iOS
- Requires macOS with Xcode
- Run \`flutter build ios --release\`
- Open Runner.xcworkspace in Xcode
- Archive and upload to App Store Connect

---
*Generated with ❤️ by RAHL*`;
  }
}

module.exports = FlutterGenerator;
