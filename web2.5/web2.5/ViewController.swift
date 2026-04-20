//
//  ViewController.swift
//  web2.5
//
//  Created by Boris Zhang on 4/18/26.
//

import Cocoa
import SafariServices
import WebKit

let extensionBundleIdentifier = "com.yourCompany.web25.extension"
let extensionStateDefaultsKey = "web25ExtensionProbe"

class ViewController: NSViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            DispatchQueue.main.async {
                guard let state = state, error == nil else {
                    self.persistExtensionState(enabled: nil, error: error)
                    if let error = error {
                        print("WEB25_EXTENSION_STATE error=\(error.localizedDescription)")
                    } else {
                        print("WEB25_EXTENSION_STATE error=unknown")
                    }
                    return
                }

                self.persistExtensionState(enabled: state.isEnabled, error: nil)
                print("WEB25_EXTENSION_STATE enabled=\(state.isEnabled)")
                if #available(macOS 13, *) {
                    webView.evaluateJavaScript("show(\(state.isEnabled), true)")
                } else {
                    webView.evaluateJavaScript("show(\(state.isEnabled), false)")
                }
            }
        }
    }

    private func persistExtensionState(enabled: Bool?, error: Error?) {
        var payload: [String: Any] = [
            "checkedAt": ISO8601DateFormatter().string(from: Date()),
        ]

        if let enabled = enabled {
            payload["enabled"] = enabled
        }

        if let error = error {
            payload["error"] = error.localizedDescription
        }

        UserDefaults.standard.set(payload, forKey: extensionStateDefaultsKey)
        UserDefaults.standard.synchronize()
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? String, body == "open-preferences" else {
            return;
        }

        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            DispatchQueue.main.async {
                NSApplication.shared.terminate(nil)
            }
        }
    }

}
