<?php

bindtextdomain("wacky-tracky", "./locale");
textdomain("wacky-tracky");

define('USE_WEBPACK', true);

?>
<!DOCTYPE html>
<html lang = "en">

<head>
	<title>wacky-tracky</title>
	
	<meta name = "viewport" content = "width=device-width, initial-scale=1.0">
	<meta name = "theme-color" content = "#2dae82">
	<meta name = "description" content = "A timer to track cooking times for multiple dishes." />

	<link rel="stylesheet" href = "style.css" />
	<link rel="manifest" href = "manifest.json" />
	<link rel="canonical" href = "https://web.wacky-tracky.com" />
	<link rel="shortcut icon" href = "resources/images/logos/wacky-tracky.png" type = "image/png" />
</head>

<body>
	<noscript>Javascript is needed.</noscript>
	<div id = "bootMessage" style = "background-color: white; padding: 1em; flex: 1 1 auto; text-align: center; font-weight: bold; margin-top: 1em;">
		<?= _("Waiting for JavaScript init"); ?>
	</div>

<?php if (USE_WEBPACK) { ?>
	<script src = "dist/firmware.js"></script>
	<script src = "dist/modules.js"></script>
	<script>main();</script>
<?php } else { ?>
	<script src = "js/firmware/util.js"></script>
	<script src = "js/firmware/middleware.js"></script>
	<script src = "js/firmware/keyboardShortcuts.js" defer></script>
	<script src = "js/firmware/sw_loader.js"></script>

	<script type = "module">
	setBootMessage("Loading main module");

	import main from "./module.js"; main();
	</script>
<?php } ?>

	<template id = "loginForm">
		<div id = "loginFormContainer">
			<h2>wacky-tracky</h2>

			<p>
				<label for = "username">Username</label>
				<input id = "username" autofocus />
			</p>

			<p>
				<label for = "password">Password</label>
				<input id = "password" type = "password" />
			</p>

			<p hidden>
				<input for = "email">Email</input>
				<input id = "email" type = "email" />
			</p>

			<p id = "loginButtons">
				<button id = "login">Login</button>
				<button id = "register">Register</button>
				<button id = "forgotPassword">Forgot Password</button>
			</p>
		</div>
	</template>

	<template id = "listControls"> 
		<div class = "listControls">
			<div class = "buttonToolbar">
				<h3>title</h3>
				<button id = "delete" aria-label = "Delete List">Delete</button>
				<button id = "settings" aria-label = "List Settings">Settings</button>
				<button id = "more" aria-label = "More List Options">&#9776;</button>
			</div>
		</div>
	</template>

	<template id = "sidePanel">
		<button id = "sidepanelMenuButton" aria-label = "Main Sidebar Menu" accesskey = "m">&#9776; wacky-tracky</button>

		<ul class = "lists" id = "listList" accesskey = "l"></ul>

		<div id = "tagList"></div>

		<div class = "buttonToolbar">
			<button id = "newList">New List</button>
			<button id = "newTag">New Tag</button>
			<button id = "refresh" title = "Refresh" aria-label = "Refresh lists">&#128472;</button>
			<button id = "raiseIssue">Raise Issue</button>
		</div>
	</template>

	<template id = "listEditor">
		<div class = "contentTab">
			<h3>List Editor</h3>

			<p>
				<label>Title <input id = "listEditorTitle"></input></label>
			</p>

			<label>Sort
				<select id = "listEditorSort">
					<option>title</option>
					<option>id</option>
					<option>tagNumericProduct</option>
				</select>
			</label>

			<div class = "buttonToolbar">
				<button id = "listEditorSave">Save</button>
			</div>
		</div>
	</template>

	<template id = "tagValueEditor">
	</template>

	<template id = "tagEditor">
		<div class = "contentTab">
			<h3>Tag Editor</h3>

			<p>
				<label>Title <input id = "tagEditorTitle"></input></label>
			</p>

			<h4>Tag Value</h4>

			<p>
				<label>Background <input id = "tagEditorBackgroundColor" type = "color" list = "colorscale"></input></label>
				<datalist id = "colorscale">
					<option>#FFB8B8</option>
					<option>#ffea58</option>
					<option>#beecbe</option>
				</datalist>
			</p>

			<p>Optional tag text/numeric value.</p>

			<div>
				<p>
					<label>Numeric Value
					<input id = "tagValueNumeric" placeholder = "eg: 5, minimum value is 1" type = "number" min = "1"></input>
					</label>
				</p>

				<p>
					<label>Text Value
					<input id = "tagValueTextual" placeholder = "eg: High Priority"></input>
					</label>
				</p>

				<button id = "tagEditorNewValue">New Value</button>
			</div>

			<div class = "buttonToolbar">
				<button id = "tagEditorSave">Save</button>
				<button id = "tagEditorDelete">Delete</button>
			</div>
		</div>
	</template>
</body>

</html>
