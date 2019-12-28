//
//  PreviewWindowController.swift
//  FigmaMirrorDesktop
//
//  Created by Nate Parrott on 12/2/19.
//  Copyright © 2019 Nate Parrott. All rights reserved.
//

import Cocoa

class PreviewWindowController: NSWindowController {
    override func windowDidLoad() {
        super.windowDidLoad()
        window?.isMovableByWindowBackground = true
    }
}

class DraggableImageView: NSImageView {
    override var mouseDownCanMoveWindow: Bool {
        return true
    }
}
