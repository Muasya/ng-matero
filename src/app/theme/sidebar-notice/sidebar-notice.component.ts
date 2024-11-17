import { Component, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-sidebar-notice',
  templateUrl: './sidebar-notice.component.html',
  styleUrl: './sidebar-notice.component.scss',
  host: {
    class: 'matero-sidebar-notice',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatBadgeModule, MatTabsModule],
})
export class SidebarNoticeComponent {
  tabs = [
    {
      label: 'Notifications',
      messages: [
        {
          icon: '🔔',
          color: 'bg-red-95',
          title: 'Head for Notification 1',
          content: `You can use the Dashboard to explore how many new users joined daily and monthly.`,
        },
        {
          icon: '📢',
          color: 'bg-azure-95',
          title: 'Head for Notification 2',
          content: `We've made some Notifications which we think you are going to love.`,
        },
        {
          icon: '⏳',
          color: 'bg-violet-95',
          title: 'Head for Notification 3',
          content: `More new features are coming soon, so stay tuned as our developers bring more features`,
        },
      ],
    },
    {
      label: 'Updates',
      messages: [
        {
          icon: '📩',
          color: 'bg-magenta-95',
          title: 'Head for Update 1',
          content: `Please go to the Updates center to check your reports.`,
        },
      ],
    },
  ];
}
