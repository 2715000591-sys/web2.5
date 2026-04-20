//
//  AppDelegate.swift
//  web2.5
//
//  Created by Boris Zhang on 4/18/26.
//

import Cocoa
import SafariServices

private let web25ExtensionBundleIdentifier = "com.yourCompany.web25.extension"

@main
class AppDelegate: NSObject, NSApplicationDelegate {

    func applicationDidFinishLaunching(_ notification: Notification) {
        guard CommandLine.arguments.contains("--open-settings") else {
            NSApp.setActivationPolicy(.regular)
            NSApp.activate(ignoringOtherApps: true)
            return
        }

        SFSafariApplication.showPreferencesForExtension(withIdentifier: web25ExtensionBundleIdentifier) { _ in
            DispatchQueue.main.async {
                NSApp.terminate(nil)
            }
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

}
