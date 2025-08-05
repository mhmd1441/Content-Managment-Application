<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\content_sections;
use App\Models\Menu;

class ContentSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menu = Menu::where('route', '/productsAndServices')->first();

        $parentcontent = content_sections::create([
            'subtitle' => 'E-Sim',
            'description' => 'This project implements an eSIM (embedded SIM) management system that allows users to activate, switch, and manage mobile network profiles digitally without needing a physical SIM card. It enhances flexibility, supports multiple profiles, and streamlines mobile connectivity through a secure and user-friendly platform.',
            'image_path' => null,
            'order' => '1',
            'is_expanded' => true,
            'status' => 'published',
            'menu_id' => $menu->id,
        ]);

        content_sections::create([
            'subtitle' => 'E-Sim Procedure',
            'description' => 'The eSIM (Embedded SIM) activation procedure involves digitally provisioning a mobile network profile without the need for a physical SIM card. The process begins by scanning a QR code or entering activation details provided by the telecom operator. Once verified, the eSIM profile is securely downloaded and installed on the device. Users can then manage multiple profiles, switch networks, or activate plans directly through the device settings. This digital approach streamlines the onboarding process, reduces physical logistics, and enhances user flexibility and mobility.',
            'image_path' => 'img/ESim.png',
            'order' => '1',
            'is_expanded' => false,
            'status' => 'published',
            'parent_id' => $parentcontent->id,
        ]);
    }
}
