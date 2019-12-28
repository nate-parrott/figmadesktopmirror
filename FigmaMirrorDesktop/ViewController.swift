//
//  ViewController.swift
//  FigmaMirrorDesktop
//
//  Created by Nate Parrott on 12/1/19.
//  Copyright © 2019 Nate Parrott. All rights reserved.
//

import Cocoa

class ViewController: NSViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
                        
        PreviewManager.shared.onPreviewChanged = { [weak self] (img: NSImage) in
            self?.setImage(img)
        }
        image = PreviewManager.shared.preview
        
        previewKey.stringValue = PreviewManager.shared.key

        // Do any additional setup after loading the view.
    }
    
    private func setImage(_ image: NSImage) {
        self.image = image
        imageView.image = image
        if let win = view.window {
            var frame = win.frame
            frame.size = image.size
            win.setFrame(frame, display: true, animate: false)
        }
        NSApp.activate(ignoringOtherApps: true)
    }

    @IBOutlet var imageView: NSImageView!
    @IBOutlet var instructionsView: NSView!
    @IBOutlet var previewKey: NSTextField!
    
    var image: NSImage? {
        get {
            return imageView.image
        }
        set(val) {
            imageView.image = val
            imageView.isHidden = (val == nil)
            instructionsView.isHidden = (val != nil)
            updateWindow()
        }
    }
    
    override func viewWillAppear() {
        super.viewWillAppear()
        updateWindow()
    }
    
    func updateWindow() {
        let hasImage = (image != nil)
        if let window = view.window {
            window.isOpaque = !hasImage
            window.backgroundColor = hasImage ? NSColor.clear : NSColor.windowBackgroundColor
            window.hasShadow = !hasImage
//            var style = window.styleMask
//            if hasImage {
//                style.remove(.)
//            }
        }
    }
}

class PreviewWindowView: NSWindow {
    override var canBecomeKey: Bool {
        return true // https://stackoverflow.com/questions/16573651/unexpected-behavior-of-nstextview-because-of-titlebar-less-nswindow
    }
}

class PreviewBGView: NSView {
    override var mouseDownCanMoveWindow: Bool {
        return true
    }
    override var isOpaque: Bool {
        return false
    }
}

