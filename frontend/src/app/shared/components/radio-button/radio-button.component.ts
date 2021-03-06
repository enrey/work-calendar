import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { ToggleButtonDataModel } from '../radio-button-group/radio-button-group.model';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioButtonComponent {
  @Input()
  public data: ToggleButtonDataModel;

  @HostBinding('style.--color')
  public get isExample(): string {
    return this.data && this.data.color;
  }

  @Input()
  defaultChoice: string;

  @Input()
  idForLabel: string;

  @Input()
  groupName: string;

  @Output() valueChosen: EventEmitter<string> = new EventEmitter();

  public choose($event) {
    this.valueChosen.emit($event.target.value);
  }
}
