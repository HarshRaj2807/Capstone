import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

export interface ConfirmationDetail {
  label: string;
  value: string;
}

@Component({
  selector: 'app-confirmation-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="overlay" (click)="close.emit()">
        <section class="dialog" (click)="$event.stopPropagation()">
          <button type="button" class="close-button" (click)="close.emit()">×</button>

          <p class="eyebrow">Confirmation</p>
          <h2>{{ title() }}</h2>
          <p class="message">{{ message() }}</p>

          @if (details().length > 0) {
            <div class="details-grid">
              @for (detail of details(); track detail.label) {
                <div class="detail-row">
                  <span>{{ detail.label }}</span>
                  <strong>{{ detail.value }}</strong>
                </div>
              }
            </div>
          }

          <div class="actions">
            @if (secondaryLabel()) {
              <button type="button" class="secondary" (click)="secondary.emit()">
                {{ secondaryLabel() }}
              </button>
            }

            <button type="button" class="primary" (click)="primary.emit()">
              {{ primaryLabel() }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 1.25rem;
      background: rgba(9, 22, 20, 0.55);
      backdrop-filter: blur(10px);
      z-index: 1000;
    }

    .dialog {
      position: relative;
      width: min(34rem, 100%);
      border-radius: 1.75rem;
      padding: 2rem;
      background:
        radial-gradient(circle at top right, rgba(221, 110, 66, 0.16), transparent 28%),
        linear-gradient(180deg, #fffdf9, #f7efe3);
      border: 1px solid rgba(15, 59, 53, 0.1);
      box-shadow: 0 30px 70px rgba(15, 36, 33, 0.22);
    }

    .close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 2.25rem;
      height: 2.25rem;
      border: none;
      border-radius: 50%;
      background: rgba(18, 41, 38, 0.08);
      color: #122926;
      font-size: 1.2rem;
      cursor: pointer;
    }

    .eyebrow {
      margin: 0 0 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.76rem;
      color: #8b4a2d;
    }

    h2 {
      margin: 0;
      font-size: 1.9rem;
      color: #122926;
      font-family: Georgia, 'Times New Roman', serif;
    }

    .message {
      margin: 0.85rem 0 1.4rem;
      color: #56605a;
      line-height: 1.7;
    }

    .details-grid {
      display: grid;
      gap: 0.8rem;
      margin-bottom: 1.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.85rem 1rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid rgba(15, 59, 53, 0.08);
    }

    .detail-row span {
      color: #6a6d66;
    }

    .detail-row strong {
      color: #122926;
      text-align: right;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .actions button {
      border: none;
      border-radius: 1rem;
      padding: 0.95rem 1.2rem;
      font-weight: 700;
      cursor: pointer;
    }

    .actions .secondary {
      background: #efe5d7;
      color: #122926;
    }

    .actions .primary {
      background: linear-gradient(135deg, #0f3b35, #1f6f63);
      color: #fff;
    }
  `]
})
export class ConfirmationPopupComponent {
  readonly visible = input(false);
  readonly title = input('');
  readonly message = input('');
  readonly primaryLabel = input('Close');
  readonly secondaryLabel = input<string | null>(null);
  readonly details = input<ConfirmationDetail[]>([]);

  readonly close = output<void>();
  readonly primary = output<void>();
  readonly secondary = output<void>();
}
