<?php
/**
 * Plugin Name: Gecko Fence Builder
 * Description: Interactive fence builder grid.
 * Version: 1.0.1
 * Author: Gecko Designs
 * Author URI: https://geckodesigns.com
 * Text Domain: greatfence
 * License: GPLv2 or later
 */

defined("ABSPATH") || exit;

add_action( "plugins_loaded", function(){
	new GeckoFenceBuilder();
} );


class GeckoFenceBuilder {
	public function __construct() {
		// Custom category registration
		add_action("init", [$this, "regist_dependencies"]);
		add_action("init", [$this, "register_block_type"]);
	}

	public function register_block_type() {
		// Register frontend script
		wp_register_script(
			"gecko-fence-builder",
			plugins_url("/dist/public.bundle.js", __FILE__),
			[
				"react-dom",
				"styled-components"
			],
			filemtime( plugin_dir_path(__FILE__) . "dist/public.bundle.js" )
		);
		// Register editor script
		wp_register_script(
			"gecko-fence-builder-editor",
			plugins_url("/dist/editor.bundle.js", __FILE__),
			[
				'wp-blocks',
				'wp-editor',
				'wp-element',
				'wp-i18n'
			],
			filemtime( plugin_dir_path(__FILE__) . "dist/editor.bundle.js" )
		);

		// If Post has block then enqueue script
		add_action( 'the_post', function($post){
			if(has_block( 'gecko/fence-builder', $post )){
				wp_enqueue_script('gecko-fence-builder');
			}
		} );

		// Initialize custom blocks
		// Dynamically import blocks in blocks folder
		register_block_type(
			"gecko/fence-builder",
			[
				"render_callback" => [$this, "render_block"],
				"editor_script" => "gecko-fence-builder-editor",
			]
		);
	}

	public function regist_dependencies() {
		wp_register_script("styled-components", "https://unpkg.com/styled-components/dist/styled-components.min.js",["react","react-dom",],false);
	}

	/**
	 * If the block is dynamic you would render the template here.
	 */
	public function render_block( $attributes, $content ) {
		$encoded = json_encode($attributes, JSON_HEX_APOS|JSON_HEX_QUOT);
		return sprintf('<FenceBuilder data-props="%s">%s</FenceBuilder>', htmlspecialchars($encoded, ENT_QUOTES, 'UTF-8'), $content);
	}

}