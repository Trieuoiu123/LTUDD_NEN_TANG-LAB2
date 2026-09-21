@echo off
set "JAVA_HOME=C:\Users\PC\.p2\pool\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_20.0.2.v20230801-2057\jre"
set "ANDROID_HOME=C:\Users\PC\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Using JAVA_HOME=%JAVA_HOME%
echo Using ANDROID_HOME=%ANDROID_HOME%

echo [1/3] Copying web assets to www/ ...
node -e "const fs=require('fs'); if(!fs.existsSync('www')) fs.mkdirSync('www'); ['index.html','editor.html','generate-icons.html','manifest.json','sw.js'].forEach(f=>{if(fs.existsSync(f)) fs.copyFileSync(f,'www/'+f);});"
call npx cap sync android

echo [2/3] Building Android APK via Gradle with OpenJDK 20...
cd android
call gradlew.bat assembleDebug
cd ..

echo [3/3] Checking output APK...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo SUCCESS: APK file generated at android\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo WARNING: Build failed. Check error above.
)
