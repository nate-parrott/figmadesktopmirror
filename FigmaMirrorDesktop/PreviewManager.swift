//
//  PreviewManager.swift
//  FigmaMirrorDesktop
//
//  Created by Nate Parrott on 12/2/19.
//  Copyright © 2019 Nate Parrott. All rights reserved.
//

import Cocoa
import FirebaseCore
import FirebaseDatabase

class PreviewManager {
    static let shared = PreviewManager()
    
    init() {
        FirebaseApp.configure()
        
        let defaultsKey = "key2"
        if let existing = UserDefaults.standard.string(forKey: defaultsKey) {
            key = existing
        } else {
            key = UUID().uuidString.lowercased().components(separatedBy: "-").joined()
            UserDefaults.standard.set(key, forKey: defaultsKey)
        }
        print("KEY: \(key)")
        
        Database.database().reference(withPath: "/preview").child(key).child("image").observe(.value) { (snapshot) in
            if let b64String = snapshot.value as? String, let data = Data(base64Encoded: b64String), let image = NSImage(data: data) {
                DispatchQueue.main.async { [weak self] in
                    self?.preview = image
                }
            }
        }
    }
    
    let key: String
    
    var preview: NSImage? {
        didSet {
            if let img = preview, let cb = onPreviewChanged {
                cb(img)
            }
        }
    }
    var onPreviewChanged: ((NSImage) -> ())?
}
